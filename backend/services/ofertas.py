"""
Serviço de ofertas diretas (intérprete → compositor).

Diferente de `ofertas_terceiros.py` (fluxo Stripe manual capture para obras
editadas por terceira editora), este módulo trata o fluxo direto:
  - Intérprete propõe um valor (oferta padrão, piso 50%) ou propõe valor
    integral (oferta de exclusividade — só se titular for PRO).
  - Compositor pode aceitar, recusar ou contra-propor (gera nova oferta
    encadeada via `contraproposta_de_id`).
  - Janela de resposta: 48h (expires_at).
  - Ao aceitar, o intérprete recebe notificação para pagar via Stripe
    Checkout, usando `valor_cents` da oferta (não o `preco_cents` da obra).
  - Ao confirmar pagamento de oferta `exclusividade`, a obra é marcada como
    `is_exclusive=true`, `exclusive_until = now + 5 anos`, `exclusive_to_id`.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from db.supabase_client import get_supabase
from services.notificacoes import notify

log = logging.getLogger("gravan.ofertas")

OFERTA_VALIDADE_HORAS = 48
EXCLUSIVIDADE_ANOS = 5

PISO_PADRAO_FRACTION = 0.50  # 50% do preço cheio


def _moeda(cents: int) -> str:
    s = f"R$ {(cents/100):,.2f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")


def _is_pro_efetivo(perfil: dict) -> bool:
    if not perfil:
        return False
    if perfil.get("plano") != "PRO":
        return False
    return perfil.get("status_assinatura") in ("ativa", "cancelada", "past_due")


# ─────────────────────────── validações ───────────────────────────

def validar_nova_oferta(
    obra: dict,
    titular: dict,
    valor_cents: int,
    tipo: str,
) -> Optional[str]:
    """
    Retorna None se válida, ou uma string com mensagem de erro.
    """
    if obra.get("is_exclusive"):
        return ("Esta obra está sob contrato de exclusividade ativa e "
                "não aceita novas ofertas.")
    if obra.get("status") != "publicada":
        return "Obra não está publicada."

    preco = int(obra.get("preco_cents") or 0)
    if preco < 100:
        return "Obra com preço inválido."

    if tipo not in ("padrao", "exclusividade"):
        return "Tipo de oferta inválido."

    if tipo == "exclusividade":
        if not _is_pro_efetivo(titular):
            return ("Ofertas de exclusividade só podem ser feitas para obras "
                    "de compositores PRO.")
        if valor_cents < preco:
            return (f"Para exclusividade, o valor mínimo é o preço integral "
                    f"da obra ({_moeda(preco)}).")
    else:
        piso = int(round(preco * PISO_PADRAO_FRACTION))
        if valor_cents < piso:
            return (f"Valor abaixo do piso de 50% do preço da obra "
                    f"({_moeda(piso)}).")

    return None


# ─────────────────────────── helpers ───────────────────────────

def _expires_at_iso() -> str:
    return (datetime.now(timezone.utc) + timedelta(hours=OFERTA_VALIDADE_HORAS)).isoformat()


def _expirar_se_vencida(of: dict) -> dict:
    """Se a oferta pendente passou do expires_at, marca como expirada."""
    if of.get("status") != "pendente":
        return of
    exp = of.get("expires_at")
    if not exp:
        return of
    try:
        dt = datetime.fromisoformat(exp.replace("Z", "+00:00"))
    except Exception:
        return of
    if dt < datetime.now(timezone.utc):
        sb = get_supabase()
        sb.table("ofertas").update({
            "status": "expirada",
            "responded_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", of["id"]).execute()
        of["status"] = "expirada"
    return of


def expirar_pendentes() -> int:
    """Job: marca todas as ofertas pendentes vencidas como 'expirada'.
    Retorna a contagem."""
    sb = get_supabase()
    now_iso = datetime.now(timezone.utc).isoformat()
    pendentes = sb.table("ofertas").select("id").eq(
        "status", "pendente"
    ).lt("expires_at", now_iso).execute().data or []
    if not pendentes:
        return 0
    ids = [p["id"] for p in pendentes]
    sb.table("ofertas").update({
        "status": "expirada",
        "responded_at": now_iso,
    }).in_("id", ids).execute()
    return len(ids)


# ─────────────────────────── notificações ───────────────────────────

def notificar_compositor_nova_oferta(of: dict, obra: dict, interprete_nome: str) -> None:
    try:
        notify(
            perfil_id=obra["titular_id"],
            tipo="oferta",
            titulo=(f"Oferta de exclusividade: \"{obra.get('nome','obra')}\""
                    if of.get("tipo") == "exclusividade"
                    else f"Nova oferta em \"{obra.get('nome','obra')}\""),
            mensagem=(
                f"{interprete_nome or 'Um intérprete'} ofereceu "
                f"{_moeda(of['valor_cents'])} pela sua obra "
                f"\"{obra.get('nome','—')}\". Você tem 48h para responder."
            ),
            link="/ofertas",
            payload={
                "oferta_id": of["id"],
                "obra_id": obra["id"],
                "valor_cents": of["valor_cents"],
                "tipo": of.get("tipo", "padrao"),
            },
        )
    except Exception as e:
        log.warning("Falha ao notificar compositor da oferta %s: %s", of.get("id"), e)


def notificar_interprete_resposta(of: dict, obra: dict, status: str) -> None:
    """status: 'aceita' | 'recusada' | 'contra_proposta' (recebeu contraoferta)"""
    titulo_map = {
        "aceita": f"Sua oferta foi aceita: \"{obra.get('nome','obra')}\"",
        "recusada": f"Oferta recusada: \"{obra.get('nome','obra')}\"",
        "contra_proposta": f"Contraproposta recebida em \"{obra.get('nome','obra')}\"",
    }
    msg_map = {
        "aceita": (f"O compositor aceitou sua oferta de {_moeda(of['valor_cents'])}. "
                   f"Vá pagar para emitir o contrato."),
        "recusada": (f"O compositor recusou sua oferta de {_moeda(of['valor_cents'])}."),
        "contra_proposta": (f"O compositor sugeriu outro valor. Confira e responda em até 48h."),
    }
    try:
        notify(
            perfil_id=of["interprete_id"],
            tipo="oferta",
            titulo=titulo_map.get(status, "Atualização da sua oferta"),
            mensagem=msg_map.get(status, ""),
            link="/ofertas",
            payload={
                "oferta_id": of["id"],
                "obra_id": obra["id"],
                "valor_cents": of["valor_cents"],
                "status": status,
            },
        )
    except Exception as e:
        log.warning("Falha ao notificar intérprete da oferta %s: %s", of.get("id"), e)


# ─────────────────────────── exclusividade ───────────────────────────

def aplicar_exclusividade_em_obra(obra_id: str, comprador_id: str) -> None:
    """
    Marca a obra como exclusiva por 5 anos e dispara comunicação formal de
    rescisão (por e-mail) ao compositor, coautores e à editora (agregada ou
    terceira), apontando a venda de exclusividade como motivo.

    Idempotente: se a obra já estiver `is_exclusive=True`, a transição é
    pulada (e os e-mails não são reenviados).
    """
    sb = get_supabase()
    until = (datetime.now(timezone.utc)
             + timedelta(days=365 * EXCLUSIVIDADE_ANOS)).isoformat()

    # Snapshot ANTES do update — pra sabermos se é a primeira vez que vira exclusiva.
    try:
        atual = sb.table("obras").select(
            "id, nome, titular_id, is_exclusive, editora_terceira_id, editora_terceira_email, editora_terceira_nome"
        ).eq("id", obra_id).single().execute().data or {}
    except Exception:
        atual = {}

    ja_exclusiva = bool(atual.get("is_exclusive"))

    try:
        sb.table("obras").update({
            "is_exclusive":    True,
            "exclusive_until": until,
            "exclusive_to_id": comprador_id,
        }).eq("id", obra_id).execute()
        log.info("Obra %s marcada como exclusiva até %s (comprador %s).",
                 obra_id, until, comprador_id)
    except Exception as e:
        log.exception("Falha ao marcar exclusividade na obra %s: %s", obra_id, e)
        return

    if ja_exclusiva:
        # Já era exclusiva (ex.: webhook duplicado). Não reenvia e-mails.
        return

    # Dispara comunicação formal de rescisão (best-effort, não bloqueia o fluxo).
    try:
        _notificar_rescisao_exclusividade(atual or {"id": obra_id}, comprador_id)
    except Exception as e:
        log.exception("Falha ao notificar rescisão de exclusividade da obra %s: %s",
                      obra_id, e)


def _notificar_rescisao_exclusividade(obra: dict, comprador_id: str) -> None:
    """
    Envia e-mail formal de rescisão ao compositor (titular), coautores e à
    editora vinculada — seja ela editora-mãe (titular agregado) ou editora
    terceira detentora dos direitos editoriais. Best-effort.
    """
    sb = get_supabase()
    obra_nome = obra.get("nome") or "obra"

    comprador = sb.table("perfis").select(
        "nome, nome_completo, nome_artistico"
    ).eq("id", comprador_id).maybe_single().execute()
    comprador = (comprador.data if comprador else None) or {}
    nome_comprador = (
        comprador.get("nome_artistico")
        or comprador.get("nome_completo")
        or comprador.get("nome")
        or "novo licenciado"
    )
    data_venda_brt = datetime.now(timezone.utc).astimezone(
        timezone(timedelta(hours=-3))  # BRT
    ).strftime("%d/%m/%Y às %H:%M (BRT)")

    # 1) Compositor + coautores
    coaut = sb.table("coautorias").select("perfil_id").eq(
        "obra_id", obra["id"]
    ).execute().data or []
    titular_id = obra.get("titular_id")
    perfil_ids = list({c["perfil_id"] for c in coaut})
    if titular_id and titular_id not in perfil_ids:
        perfil_ids.append(titular_id)

    perfis = []
    if perfil_ids:
        perfis = sb.table("perfis").select(
            "id, nome, nome_completo, email, publisher_id"
        ).in_("id", perfil_ids).execute().data or []

    # E-mail por destinatário (dedup por endereço)
    enviados: set[str] = set()

    from services.email_service import (
        send_email,
        render_rescisao_exclusividade_email,
    )

    titular_publisher_id: Optional[str] = None
    for p in perfis:
        email = (p.get("email") or "").strip().lower()
        if not email or email in enviados:
            continue
        papel = "compositor" if p.get("id") == titular_id else "coautor"
        nome  = p.get("nome_completo") or p.get("nome") or ""
        try:
            html, text = render_rescisao_exclusividade_email(
                nome_destinatario=nome,
                papel=papel,
                nome_obra=obra_nome,
                nome_comprador=nome_comprador,
                data_venda_brt=data_venda_brt,
            )
            send_email(email, f"Rescisão — \"{obra_nome}\"", html, text)
            enviados.add(email)
        except Exception as e:
            log.warning("Falha ao enviar rescisão p/ %s: %s", email, e)
        if p.get("id") == titular_id:
            titular_publisher_id = p.get("publisher_id")

    # 2) Editora agregada (se titular for agregado a uma publisher)
    if titular_publisher_id:
        try:
            ed = sb.table("perfis").select(
                "razao_social, nome_completo, nome, email"
            ).eq("id", titular_publisher_id).maybe_single().execute()
            ed = (ed.data if ed else None) or {}
            email = (ed.get("email") or "").strip().lower()
            if email and email not in enviados:
                nome_ed = ed.get("razao_social") or ed.get("nome_completo") or ed.get("nome") or ""
                html, text = render_rescisao_exclusividade_email(
                    nome_destinatario=nome_ed,
                    papel="editora",
                    nome_obra=obra_nome,
                    nome_comprador=nome_comprador,
                    data_venda_brt=data_venda_brt,
                )
                send_email(email, f"Rescisão — \"{obra_nome}\"", html, text)
                enviados.add(email)
        except Exception as e:
            log.warning("Falha ao notificar editora agregada (%s): %s",
                        titular_publisher_id, e)

    # 3) Editora terceira (se a obra tem vínculo editorial externo)
    ed_terc_email = (obra.get("editora_terceira_email") or "").strip().lower()
    if ed_terc_email and ed_terc_email not in enviados:
        try:
            html, text = render_rescisao_exclusividade_email(
                nome_destinatario=obra.get("editora_terceira_nome") or "",
                papel="editora",
                nome_obra=obra_nome,
                nome_comprador=nome_comprador,
                data_venda_brt=data_venda_brt,
            )
            send_email(ed_terc_email, f"Rescisão — \"{obra_nome}\"", html, text)
            enviados.add(ed_terc_email)
        except Exception as e:
            log.warning("Falha ao notificar editora terceira (%s): %s",
                        ed_terc_email, e)

    log.info("Rescisão por exclusividade da obra %s comunicada a %d destinatários.",
             obra.get("id"), len(enviados))
