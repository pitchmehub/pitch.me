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
    """Marca a obra como exclusiva por 5 anos."""
    sb = get_supabase()
    until = (datetime.now(timezone.utc)
             + timedelta(days=365 * EXCLUSIVIDADE_ANOS)).isoformat()
    try:
        sb.table("obras").update({
            "is_exclusive": True,
            "exclusive_until": until,
            "exclusive_to_id": comprador_id,
        }).eq("id", obra_id).execute()
        log.info("Obra %s marcada como exclusiva até %s (comprador %s).",
                 obra_id, until, comprador_id)
    except Exception as e:
        log.exception("Falha ao marcar exclusividade na obra %s: %s", obra_id, e)
