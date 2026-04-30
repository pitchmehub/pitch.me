"""
Bulk Upload de Obras pela EDITORA.

A editora envia um arquivo .zip contendo:
  - 1 arquivo CSV (UTF-8, separador vírgula) com a lista de obras.
  - N arquivos .mp3, referenciados por nome na coluna `arquivo_audio`.

Cada linha do CSV vira uma chamada a `ObraService.criar_obra` em nome
do TITULAR informado (que precisa ser um agregado da editora). Após
criar a obra com sucesso, vincula `publisher_id` e gera contrato de
edição autor↔editora via `services.contrato_publisher`.

Funções públicas:
    - gerar_csv_template() -> bytes
    - processar_zip(publisher_id, zip_bytes, max_linhas=200) -> dict

Limites: o ZIP deve ter no máximo `max_linhas` obras (default 200).
"""
from __future__ import annotations

import csv
import io
import re
import zipfile
from datetime import datetime

from werkzeug.exceptions import HTTPException

from db.supabase_client import get_supabase
from services.obras import ObraService
from utils.crypto import decrypt_pii


CSV_HEADERS = [
    "titulo",
    "letra",
    "genero",
    "preco_brl",
    "arquivo_audio",
    "titular_cpf",
    "titular_email",
    "coautores",
]

GENEROS_PERMITIDOS = {
    "Sertanejo", "MPB", "Funk", "Samba", "Rock", "Pop",
    "Gospel", "Forró", "Pagode", "RNB", "RAP", "OUTROS",
}


# ──────────────────────────── template ──────────────────────────
def gerar_csv_template() -> bytes:
    """CSV de exemplo, UTF-8 com BOM (compatível com Excel pt-BR)."""
    buf = io.StringIO()
    writer = csv.writer(buf, delimiter=",", quoting=csv.QUOTE_MINIMAL)
    writer.writerow(CSV_HEADERS)
    writer.writerow([
        "Nome da Obra Exemplo",
        "Refrão da letra...\\nVerso 2...",
        "Sertanejo",
        "199.90",
        "obra_exemplo.mp3",
        "12345678909",
        "compositor@exemplo.com",
        "outro@exemplo.com:30",
    ])
    writer.writerow([
        "# Instruções: titular_cpf OU titular_email (basta um). "
        "coautores opcional, formato 'email:share_pct;email2:share_pct'. "
        "Sem coautores = titular 100%. Soma dos shares deve dar 100.",
        "", "", "", "", "", "", "",
    ])
    return ("\ufeff" + buf.getvalue()).encode("utf-8")


# ──────────────────────────── helpers ───────────────────────────
def _digits(s: str | None) -> str:
    return re.sub(r"\D", "", s or "")


def _parse_preco(raw: str) -> int:
    """Aceita '199,90', '199.90', 'R$ 199,90'. Retorna cents."""
    s = (raw or "").strip()
    s = s.replace("R$", "").replace(" ", "")
    if "," in s and "." in s:
        s = s.replace(".", "").replace(",", ".")
    elif "," in s:
        s = s.replace(",", ".")
    if not s:
        raise ValueError("preco_brl ausente.")
    valor = float(s)
    if valor <= 0:
        raise ValueError("preco_brl deve ser positivo.")
    return int(round(valor * 100))


def _parse_coautores(raw: str) -> list[tuple[str, float]]:
    """'email:30;email2:20' -> [(email,30.0),(email2,20.0)]"""
    raw = (raw or "").strip()
    if not raw:
        return []
    out: list[tuple[str, float]] = []
    for parte in re.split(r"[;\n]", raw):
        parte = parte.strip()
        if not parte:
            continue
        if ":" not in parte:
            raise ValueError(
                f"coautor mal-formatado '{parte}', use 'email:share_pct'."
            )
        email, share = parte.split(":", 1)
        email = email.strip().lower()
        try:
            share_f = float(share.strip().replace(",", "."))
        except ValueError:
            raise ValueError(f"share inválido para '{email}'.")
        if not email or "@" not in email:
            raise ValueError(f"email inválido em coautores: '{email}'.")
        if share_f <= 0 or share_f >= 100:
            raise ValueError(
                f"share_pct de coautor deve estar entre 0 e 100 (excl.)."
            )
        out.append((email, share_f))
    return out


def _agregados_da_editora(publisher_id: str) -> list[dict]:
    """Carrega TODOS os agregados da editora (titulares válidos)."""
    sb = get_supabase()
    rows = (
        sb.table("perfis")
          .select("id, email, cpf, cpf_display, nome_completo, nome_artistico")
          .eq("publisher_id", publisher_id)
          .execute()
    ).data or []
    return rows


def _resolver_titular(
    agregados: list[dict],
    cpf_raw: str,
    email_raw: str,
) -> dict:
    cpf = _digits(cpf_raw)
    email = (email_raw or "").strip().lower()

    if not cpf and not email:
        raise ValueError(
            "Informe titular_cpf OU titular_email — nenhum foi enviado."
        )

    for a in agregados:
        # Match por email
        if email and (a.get("email") or "").lower() == email:
            return a
        # Match por CPF (display ou decrypt)
        cpf_display = _digits(a.get("cpf_display"))
        if cpf and cpf_display and cpf_display == cpf:
            return a
        if cpf and a.get("cpf"):
            try:
                dec = _digits(decrypt_pii(a["cpf"]) or "")
                if dec and dec == cpf:
                    return a
            except Exception:
                continue
    raise ValueError(
        "Titular não encontrado entre os agregados desta editora "
        f"(cpf={cpf or '-'}, email={email or '-'})."
    )


def _resolver_coautor_email(email: str) -> str:
    """Retorna perfil_id do coautor (qualquer compositor da plataforma)."""
    sb = get_supabase()
    r = (
        sb.table("perfis")
          .select("id, email, role")
          .eq("email", email)
          .limit(1)
          .execute()
    ).data or []
    if not r:
        raise ValueError(
            f"Coautor com email '{email}' não está cadastrado na plataforma."
        )
    return r[0]["id"]


def _vincular_publisher_e_contrato(obra_id: str, autor_id: str, publisher_id: str):
    """Replica o pós-processamento da rota POST /api/obras."""
    sb = get_supabase()
    try:
        sb.table("obras").update({"publisher_id": publisher_id}).eq("id", obra_id).execute()
    except Exception:
        pass
    try:
        from services.contrato_publisher import gerar_contrato_edicao
        gerar_contrato_edicao(obra_id, autor_id, publisher_id)
    except Exception:
        pass


# ─────────────────────────── processamento ──────────────────────
def processar_zip(
    publisher_id: str,
    zip_bytes: bytes,
    max_linhas: int = 200,
    max_zip_bytes: int = 200 * 1024 * 1024,
) -> dict:
    """
    Processa o ZIP enviado pela editora. Retorna:
      {
        "criadas":   [ {linha, obra_id, titulo, titular_id} ],
        "erros":     [ {linha, titulo, motivo} ],
        "total_csv": int,
        "iniciado_em": iso,
        "finalizado_em": iso,
      }
    """
    iniciado = datetime.utcnow().isoformat() + "Z"

    if not zip_bytes:
        raise ValueError("Arquivo .zip vazio.")
    if len(zip_bytes) > max_zip_bytes:
        raise ValueError(
            f"Arquivo .zip excede o limite de {max_zip_bytes // (1024 * 1024)} MB."
        )

    try:
        zf = zipfile.ZipFile(io.BytesIO(zip_bytes))
    except zipfile.BadZipFile:
        raise ValueError("Arquivo .zip inválido ou corrompido.")

    # Localiza o CSV (primeiro .csv encontrado)
    nomes = zf.namelist()
    csv_names = [n for n in nomes if n.lower().endswith(".csv") and not n.startswith("__MACOSX")]
    if not csv_names:
        raise ValueError("Nenhum arquivo .csv encontrado dentro do .zip.")
    csv_name = csv_names[0]

    raw = zf.read(csv_name).decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(raw), delimiter=",")

    headers_lidos = [h.strip() for h in (reader.fieldnames or [])]
    faltam = [h for h in CSV_HEADERS if h not in headers_lidos]
    if faltam:
        raise ValueError(
            "CSV inválido. Faltam colunas obrigatórias: " + ", ".join(faltam)
        )

    linhas_csv = [row for row in reader if any((v or "").strip() for v in row.values())]
    # Remove linhas que começam com '#' na coluna titulo (comentário)
    linhas_csv = [r for r in linhas_csv if not (r.get("titulo") or "").lstrip().startswith("#")]

    if len(linhas_csv) == 0:
        raise ValueError("CSV não contém nenhuma obra para processar.")
    if len(linhas_csv) > max_linhas:
        raise ValueError(
            f"CSV contém {len(linhas_csv)} linhas; o limite é {max_linhas} por upload."
        )

    # Pré-resolve agregados (1 query)
    agregados = _agregados_da_editora(publisher_id)
    if not agregados:
        raise ValueError(
            "Esta editora ainda não possui agregados. Cadastre seus "
            "compositores antes de fazer upload em massa."
        )

    # Cache audio bytes por nome (case-insensitive)
    audio_index = {n.split("/")[-1].lower(): n for n in nomes if n.lower().endswith(".mp3")}

    svc = ObraService()
    criadas: list[dict] = []
    erros: list[dict] = []

    for idx, row in enumerate(linhas_csv, start=2):  # linha 1 é cabeçalho
        titulo = (row.get("titulo") or "").strip()
        try:
            letra = (row.get("letra") or "").replace("\\n", "\n").strip()
            genero = (row.get("genero") or "").strip()
            arquivo_audio = (row.get("arquivo_audio") or "").strip()

            if not titulo:
                raise ValueError("titulo obrigatório.")
            if not letra:
                raise ValueError("letra obrigatória.")
            if genero not in GENEROS_PERMITIDOS:
                raise ValueError(
                    "genero inválido. Permitidos: " + ", ".join(sorted(GENEROS_PERMITIDOS))
                )
            preco_cents = _parse_preco(row.get("preco_brl") or "")

            if not arquivo_audio:
                raise ValueError("arquivo_audio obrigatório.")
            audio_key = arquivo_audio.lower()
            if audio_key not in audio_index:
                raise ValueError(
                    f"arquivo '{arquivo_audio}' não encontrado dentro do .zip."
                )
            audio_bytes = zf.read(audio_index[audio_key])

            # Resolve titular
            titular = _resolver_titular(
                agregados,
                row.get("titular_cpf") or "",
                row.get("titular_email") or "",
            )
            titular_id = titular["id"]

            # Resolve coautores
            coautores_raw = _parse_coautores(row.get("coautores") or "")
            coautorias = [{"perfil_id": titular_id, "share_pct": 100.0}]
            if coautores_raw:
                share_titular = 100.0 - sum(s for _, s in coautores_raw)
                if share_titular <= 0:
                    raise ValueError(
                        "Soma dos shares dos coautores >= 100. O titular precisa de share > 0."
                    )
                coautorias = [{"perfil_id": titular_id, "share_pct": share_titular}]
                for email, share in coautores_raw:
                    coautor_id = _resolver_coautor_email(email)
                    if coautor_id == titular_id:
                        raise ValueError(
                            f"coautor '{email}' é o próprio titular."
                        )
                    coautorias.append({"perfil_id": coautor_id, "share_pct": share})

            obra = svc.criar_obra(
                titular_id=titular_id,
                nome=titulo,
                letra=letra,
                genero=genero,
                preco_cents=preco_cents,
                audio_bytes=audio_bytes,
                coautorias=coautorias,
                termos_aceitos=True,
            )

            _vincular_publisher_e_contrato(obra["id"], titular_id, publisher_id)

            criadas.append({
                "linha": idx,
                "obra_id": obra["id"],
                "titulo": titulo,
                "titular_id": titular_id,
                "titular_nome": (
                    titular.get("nome_artistico")
                    or titular.get("nome_completo")
                    or titular.get("email")
                ),
            })

        except HTTPException as he:
            erros.append({
                "linha": idx,
                "titulo": titulo or "(sem título)",
                "motivo": getattr(he, "description", str(he)),
            })
        except ValueError as ve:
            erros.append({
                "linha": idx,
                "titulo": titulo or "(sem título)",
                "motivo": str(ve),
            })
        except Exception as e:
            erros.append({
                "linha": idx,
                "titulo": titulo or "(sem título)",
                "motivo": f"erro inesperado: {e}",
            })

    return {
        "criadas": criadas,
        "erros": erros,
        "total_csv": len(linhas_csv),
        "iniciado_em": iniciado,
        "finalizado_em": datetime.utcnow().isoformat() + "Z",
    }
