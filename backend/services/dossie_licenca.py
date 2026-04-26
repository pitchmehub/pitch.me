"""
Gravan — Dossiê de Licença (pacote premium do COMPRADOR)
=========================================================

Gera um ZIP entregue ao comprador da licença, contendo:

  Dossie-de-Licenca-<obra>/
    01 - Letra.pdf            ← PDF formatado, com logo Gravan e tipografia premium
    02 - Audio.mp3            ← áudio original da composição (do bucket obras-audio)
    03 - Contrato.pdf         ← cópia do contrato de licenciamento assinado

Acesso restrito: apenas o COMPRADOR da transação (buyer_id) pode baixar.
"""
from __future__ import annotations

import io
import logging
import os
import re
import zipfile
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, KeepTogether,
)

from db.supabase_client import get_supabase
from services.contrato_pdf import gerar_pdf_contrato

log = logging.getLogger(__name__)

LOGO_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "gravan-logo.png")


# ──────────────────────────────────────────────────────────────────
# Helpers de nome de arquivo
# ──────────────────────────────────────────────────────────────────
def _slug(s: str, maxlen: int = 50) -> str:
    s = (s or "").strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return (s or "obra")[:maxlen]


# ──────────────────────────────────────────────────────────────────
# PDF da letra — premium
# ──────────────────────────────────────────────────────────────────
def _pdf_letra(obra: dict, autores_nomes: list[str]) -> bytes:
    """
    Gera PDF da letra em layout premium:
      - Logo Gravan no topo, centralizado
      - Título da obra em serifada grande (Times-Bold)
      - Subtítulo: gênero / autores
      - Linha decorativa
      - Letra centralizada com tipografia leve e espaçamento generoso
      - Rodapé com data e marca
    """
    nome = (obra.get("nome") or "Composição").strip()
    genero = (obra.get("genero") or "").strip()
    letra = (obra.get("letra") or "").strip() or "(Letra não disponível)"

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=2.6 * cm, rightMargin=2.6 * cm,
        topMargin=2.0 * cm, bottomMargin=2.2 * cm,
        title=f"{nome} — Letra · Gravan",
        author="Gravan",
        subject="Letra da composição",
    )

    # Estilos premium — paleta sóbria
    INK = colors.HexColor("#0B1220")
    MUTED = colors.HexColor("#6B7280")
    ACCENT = colors.HexColor("#083257")
    SUBTLE = colors.HexColor("#D1D5DB")

    title_style = ParagraphStyle(
        "title",
        fontName="Times-Bold", fontSize=28, leading=34,
        alignment=TA_CENTER, textColor=INK, spaceAfter=8,
    )
    subtitle_style = ParagraphStyle(
        "subtitle",
        fontName="Times-Italic", fontSize=12, leading=16,
        alignment=TA_CENTER, textColor=MUTED, spaceAfter=4,
    )
    autor_style = ParagraphStyle(
        "autores",
        fontName="Helvetica", fontSize=10, leading=14,
        alignment=TA_CENTER, textColor=ACCENT, spaceAfter=18,
        textTransform="uppercase",
    )
    letra_style = ParagraphStyle(
        "letra",
        fontName="Helvetica", fontSize=12.5, leading=22,
        alignment=TA_CENTER, textColor=INK, spaceAfter=12,
    )
    estrofe_sep = ParagraphStyle(
        "sep",
        fontName="Helvetica", fontSize=10, leading=14,
        alignment=TA_CENTER, textColor=SUBTLE, spaceAfter=12,
    )
    rodape_style = ParagraphStyle(
        "rodape",
        fontName="Helvetica", fontSize=8, leading=12,
        alignment=TA_CENTER, textColor=MUTED,
    )

    story = []

    # Logo
    if os.path.exists(LOGO_PATH):
        try:
            img = Image(LOGO_PATH, width=4.0 * cm, height=2.9 * cm)
            img.hAlign = "CENTER"
            story.append(img)
            story.append(Spacer(1, 0.6 * cm))
        except Exception as e:
            log.warning("Falha ao incluir logo no PDF de letra: %s", e)

    # Título
    story.append(Paragraph(_xml_escape(nome), title_style))

    # Subtítulo (gênero)
    if genero:
        story.append(Paragraph(_xml_escape(genero), subtitle_style))

    # Autores
    if autores_nomes:
        autores_txt = " · ".join([_xml_escape(a) for a in autores_nomes if a])
        story.append(Paragraph(autores_txt, autor_style))
    else:
        story.append(Spacer(1, 0.4 * cm))

    # Linha decorativa
    story.append(Paragraph("◆ ◆ ◆", estrofe_sep))
    story.append(Spacer(1, 0.4 * cm))

    # Letra — quebrada por estrofes (linhas em branco)
    estrofes = [e.strip() for e in re.split(r"\n\s*\n", letra) if e.strip()]
    for i, estrofe in enumerate(estrofes):
        linhas = "<br/>".join(_xml_escape(l).strip() for l in estrofe.splitlines() if l.strip())
        story.append(KeepTogether(Paragraph(linhas, letra_style)))
        if i < len(estrofes) - 1:
            story.append(Paragraph("◇", estrofe_sep))

    # Rodapé final
    story.append(Spacer(1, 0.8 * cm))
    story.append(Paragraph(
        f"Documento gerado em {datetime.utcnow().strftime('%d/%m/%Y')} · "
        f"Plataforma <b>Gravan</b>",
        rodape_style,
    ))

    def _on_page(canvas, d):
        canvas.saveState()
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(MUTED)
        canvas.drawCentredString(A4[0] / 2, 1.0 * cm, f"Gravan · Dossiê de Licença · {nome}")
        canvas.restoreState()

    doc.build(story, onFirstPage=_on_page, onLaterPages=_on_page)
    return buf.getvalue()


def _xml_escape(s: str) -> str:
    return (
        (s or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


# ──────────────────────────────────────────────────────────────────
# Verifica se o usuário pode baixar o dossiê (é o comprador)
# ──────────────────────────────────────────────────────────────────
def usuario_pode_baixar(contract_id: str, user_id: str) -> tuple[bool, dict | None]:
    """Retorna (autorizado, contract_dict). Apenas o buyer_id do contrato pode."""
    sb = get_supabase()
    r = (
        sb.table("contracts")
        .select("id, buyer_id, obra_id, transacao_id, contract_text, status, created_at, completed_at")
        .eq("id", contract_id)
        .limit(1)
        .execute()
    )
    if not r.data:
        return False, None
    c = r.data[0]
    return (c.get("buyer_id") == user_id), c


# ──────────────────────────────────────────────────────────────────
# Geração do ZIP do Dossiê de Licença
# ──────────────────────────────────────────────────────────────────
def gerar_zip_dossie_licenca(contract_id: str, requesting_user_id: str) -> tuple[bytes, str]:
    """
    Gera o ZIP do dossiê de licença para o COMPRADOR de uma licença.

    Retorna (zip_bytes, filename_sugerido).
    Erra com ValueError em casos esperados (404/403/422).
    """
    sb = get_supabase()

    autorizado, c = usuario_pode_baixar(contract_id, requesting_user_id)
    if not c:
        raise ValueError("Contrato não encontrado.")
    if not autorizado:
        raise PermissionError("Apenas o comprador da licença pode baixar o Dossiê de Licença.")

    # Obra
    obra_resp = sb.table("obras").select(
        "id, nome, genero, letra, audio_path, titular_id"
    ).eq("id", c["obra_id"]).limit(1).execute()
    if not obra_resp.data:
        raise ValueError("Obra do contrato não encontrada.")
    obra = obra_resp.data[0]

    # Autores (titular + coautores) — para o cabeçalho do PDF da letra
    autores_nomes: list[str] = []
    try:
        coaut = sb.table("coautorias").select("perfil_id").eq("obra_id", obra["id"]).execute().data or []
        ids = list({x["perfil_id"] for x in coaut} | {obra.get("titular_id")} - {None})
        if ids:
            perfis = sb.table("perfis").select("id, nome, nome_artistico, nome_completo").in_("id", ids).execute().data or []
            ordenados = sorted(perfis, key=lambda p: 0 if p["id"] == obra.get("titular_id") else 1)
            for p in ordenados:
                autores_nomes.append(p.get("nome_artistico") or p.get("nome_completo") or p.get("nome") or "")
    except Exception as e:
        log.warning("dossie_licenca: falha ao montar autores (%s) — segue sem", e)

    # 1) PDF da letra
    try:
        pdf_letra = _pdf_letra(obra, [a for a in autores_nomes if a])
    except Exception as e:
        log.exception("dossie_licenca: falha ao gerar PDF da letra")
        raise ValueError(f"Falha ao gerar PDF da letra: {e}")

    # 2) Áudio MP3 (do bucket obras-audio)
    audio_bytes: bytes | None = None
    audio_path = obra.get("audio_path")
    if audio_path:
        try:
            audio_bytes = sb.storage.from_("obras-audio").download(audio_path)
        except Exception as e:
            log.warning("dossie_licenca: falha ao baixar áudio %s: %s", audio_path, e)

    # 3) PDF do contrato (reaproveita renderizador)
    try:
        contrato_doc = {
            "id":            c["id"],
            "obra_id":       c["obra_id"],
            "versao":        "v1.0",
            "assinado_em":   c.get("completed_at") or c.get("created_at"),
            "ip_assinatura": "—",
            "dados_titular": {"conteudo_hash": ""},
            "conteudo":      c.get("contract_text") or "",
        }
        pdf_contrato = gerar_pdf_contrato(contrato_doc)
    except Exception as e:
        log.exception("dossie_licenca: falha ao gerar PDF do contrato")
        raise ValueError(f"Falha ao gerar PDF do contrato: {e}")

    # 4) Monta o ZIP
    nome_obra = obra.get("nome") or "obra"
    pasta = f"Dossie-de-Licenca-{_slug(nome_obra)}"

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(f"{pasta}/01 - Letra.pdf", pdf_letra)
        if audio_bytes:
            # mantém a extensão original quando possível (m4a/mp3/wav/etc.)
            ext = "mp3"
            if audio_path and "." in audio_path.split("/")[-1]:
                cand = audio_path.rsplit(".", 1)[-1].lower()
                if cand in {"mp3", "m4a", "wav", "aac", "ogg", "flac"}:
                    ext = cand
            zf.writestr(f"{pasta}/02 - Audio.{ext}", audio_bytes)
        else:
            zf.writestr(
                f"{pasta}/02 - Audio - INDISPONIVEL.txt",
                "O arquivo de áudio não estava disponível no momento da geração do dossiê.\n"
                "Entre em contato com o suporte da Gravan se desejar uma cópia.\n",
            )
        zf.writestr(f"{pasta}/03 - Contrato.pdf", pdf_contrato)

        # Pequeno README para o comprador
        readme = (
            f"Dossiê de Licença — {nome_obra}\n"
            f"Plataforma Gravan · gerado em {datetime.utcnow().strftime('%d/%m/%Y às %H:%M UTC')}\n\n"
            f"Conteúdo deste pacote:\n"
            f"  • 01 - Letra.pdf      → versão impressa da letra\n"
            f"  • 02 - Audio.<ext>    → áudio original da composição\n"
            f"  • 03 - Contrato.pdf   → cópia do contrato de licenciamento\n\n"
            f"Este pacote é uma cortesia da Gravan ao comprador da licença.\n"
            f"Para suporte: gravan@gravan.com.br\n"
        )
        zf.writestr(f"{pasta}/LEIA-ME.txt", readme)

    filename = f"Dossie-de-Licenca-{_slug(nome_obra)}.zip"
    return buf.getvalue(), filename
