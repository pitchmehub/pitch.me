"""
Reconciliação de contratos de edição faltantes.

Varre as obras que têm `publisher_id` setado e gera um contrato de edição
para cada uma que ainda não possui registro em `contracts_edicao`. Útil
quando alguma obra foi cadastrada num período em que o cliente Supabase
estava com problema (URL inválida, indisponibilidade, etc.) e o contrato
não chegou a ser criado.

Idempotente: a função `gerar_contrato_edicao` já evita duplicação.
"""
from db.supabase_client import get_supabase
from services.contrato_publisher import gerar_contrato_edicao


def reconciliar(notificar: bool = True) -> dict:
    """
    Retorna dict com resumo:
      {
        "obras_analisadas": int,
        "ja_tinham_contrato": int,
        "contratos_criados": int,
        "erros": [ {obra_id, erro}, ... ],
        "criados": [ {obra_id, contract_id, publisher_id, autor_id}, ... ],
      }
    """
    sb = get_supabase()

    # Obras com publisher_id (de agregado ou via editora terceira já cadastrada)
    obras_q = sb.table("obras").select("id, titular_id, publisher_id, nome") \
        .not_.is_("publisher_id", "null").execute()
    obras = obras_q.data or []

    # Set com (obra_id, autor_id) que já possuem contrato — evita N+1 chamadas
    contratos_q = sb.table("contracts_edicao").select("obra_id, autor_id, publisher_id").execute()
    existentes = {(c["obra_id"], c["autor_id"]) for c in (contratos_q.data or [])}

    criados, erros, ja_tinham = [], [], 0

    for o in obras:
        obra_id     = o.get("id")
        autor_id    = o.get("titular_id")
        publisher_id = o.get("publisher_id")
        if not (obra_id and autor_id and publisher_id):
            erros.append({"obra_id": obra_id, "erro": "campos faltando (titular_id/publisher_id)"})
            continue

        if (obra_id, autor_id) in existentes:
            ja_tinham += 1
            continue

        try:
            contrato = gerar_contrato_edicao(obra_id, autor_id, publisher_id)
            if contrato and contrato.get("id"):
                criados.append({
                    "obra_id":      obra_id,
                    "contract_id":  contrato["id"],
                    "publisher_id": publisher_id,
                    "autor_id":     autor_id,
                    "obra_nome":    o.get("nome"),
                })
                if notificar:
                    try:
                        from services.notificacoes import notify
                        notify(
                            perfil_id=publisher_id,
                            tipo="obra_cadastrada",
                            titulo="Contrato de edição disponível",
                            mensagem=(
                                f"Um contrato de edição foi gerado para a obra "
                                f"\"{o.get('nome') or 'sem nome'}\" e está aguardando sua assinatura."
                            ),
                            link="/contratos",
                            payload={"obra_id": obra_id, "via": "reconciliacao"},
                        )
                    except Exception as e:
                        print(f"[reconciliar] notify falhou para {publisher_id}: {e}")
        except Exception as e:
            erros.append({"obra_id": obra_id, "erro": repr(e)})

    return {
        "obras_analisadas":  len(obras),
        "ja_tinham_contrato": ja_tinham,
        "contratos_criados":  len(criados),
        "erros":              erros,
        "criados":            criados,
    }
