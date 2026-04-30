"""
Rotas /api/financeiro
- GET  /api/financeiro/recibos-mensais         lista meses com renda
- GET  /api/financeiro/recibo-mensal           recibo do mês (JSON)
- GET  /api/financeiro/recibo-mensal/pdf       recibo do mês (PDF)

Funciona para qualquer perfil (compositor ou editora). A fonte canônica
é a tabela `pagamentos_compositores` — cada linha é um crédito de
wallet, independentemente do papel do beneficiário.
"""
import io
import logging

from flask import Blueprint, abort, g, jsonify, request, send_file

from middleware.auth import require_auth
from services.recibo_fiscal import (
    gerar_dados_recibo,
    gerar_pdf_recibo,
    meses_com_renda,
)

logger = logging.getLogger(__name__)

financeiro_bp = Blueprint("financeiro", __name__, url_prefix="/api/financeiro")


def _parse_periodo() -> tuple[int, int]:
    try:
        ano = int(request.args.get("ano", "0"))
        mes = int(request.args.get("mes", "0"))
    except ValueError:
        abort(422, description="Parâmetros 'ano' e 'mes' devem ser inteiros.")
    if not (2000 <= ano <= 2100) or not (1 <= mes <= 12):
        abort(422, description="Período inválido. Informe ano (>=2000) e mes (1-12).")
    return ano, mes


@financeiro_bp.get("/recibos-mensais")
@require_auth
def listar_recibos_mensais():
    """Retorna até 12 meses recentes em que o perfil teve crédito > 0."""
    try:
        limite = int(request.args.get("limite", "12"))
    except ValueError:
        limite = 12
    limite = max(1, min(limite, 36))
    itens = meses_com_renda(str(g.user.id), limite_meses=limite)
    return jsonify({"itens": itens})


@financeiro_bp.get("/recibo-mensal")
@require_auth
def recibo_mensal_json():
    ano, mes = _parse_periodo()
    try:
        dados = gerar_dados_recibo(str(g.user.id), ano, mes)
    except ValueError as ve:
        abort(422, description=str(ve))
    except Exception as e:
        logger.exception("recibo-mensal: erro %s", e)
        abort(500, description="Erro ao gerar recibo.")
    return jsonify(dados)


@financeiro_bp.get("/recibo-mensal/pdf")
@require_auth
def recibo_mensal_pdf():
    ano, mes = _parse_periodo()
    try:
        dados = gerar_dados_recibo(str(g.user.id), ano, mes)
        pdf_bytes = gerar_pdf_recibo(dados)
    except ValueError as ve:
        abort(422, description=str(ve))
    except Exception as e:
        logger.exception("recibo-mensal/pdf: erro %s", e)
        abort(500, description="Erro ao gerar PDF do recibo.")

    filename = f"recibo-gravan-{ano:04d}-{mes:02d}.pdf"
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename,
    )
