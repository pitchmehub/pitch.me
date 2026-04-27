"""
Reenvia notificação de acesso para TODOS os contratos de edição já gerados.

Útil quando os contratos foram criados mas algum destinatário (editora ou
autor) não recebeu/perdeu a notificação original e precisa ser avisado de
novo de que pode acessar e assinar.

Idempotente do ponto de vista do contrato — não recria nada, apenas dispara
notificações in-app + Web Push.

Uso:
  cd backend && python scripts/reenviar_acesso_contratos.py
  cd backend && python scripts/reenviar_acesso_contratos.py --so-pendentes
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from db.supabase_client import get_supabase  # noqa: E402
from services.notificacoes import notify  # noqa: E402


def main():
    so_pendentes = "--so-pendentes" in sys.argv
    sb = get_supabase()

    q = sb.table("contracts_edicao").select(
        "id, obra_id, autor_id, publisher_id, status, "
        "obras(nome)"
    )
    if so_pendentes:
        q = q.eq("status", "pendente")
    contratos = q.execute().data or []

    print(f"[reenviar_acesso_contratos] contratos encontrados: {len(contratos)} "
          f"(somente pendentes={so_pendentes})")

    enviados_publisher = 0
    enviados_autor = 0
    erros = []

    for c in contratos:
        obra = c.get("obras") or {}
        nome_obra = obra.get("nome") or "—"
        contract_id = c.get("id")
        publisher_id = c.get("publisher_id")
        autor_id = c.get("autor_id")

        # 1) Notifica a editora
        if publisher_id:
            try:
                notify(
                    perfil_id=publisher_id,
                    tipo="obra_cadastrada",
                    titulo="Contrato de edição disponível",
                    mensagem=(
                        f'O contrato de edição da obra "{nome_obra}" '
                        f"está disponível e aguardando sua assinatura."
                    ),
                    link="/contratos",
                    payload={
                        "obra_id": c.get("obra_id"),
                        "contract_id": contract_id,
                        "via": "reenvio_acesso",
                    },
                )
                enviados_publisher += 1
            except Exception as e:
                erros.append({"contract_id": contract_id, "destino": "publisher", "erro": repr(e)})

        # 2) Notifica o autor
        if autor_id:
            try:
                notify(
                    perfil_id=autor_id,
                    tipo="obra_cadastrada",
                    titulo="Seu contrato de edição está disponível",
                    mensagem=(
                        f'Seu contrato de edição da obra "{nome_obra}" '
                        f"está disponível para consulta e assinatura."
                    ),
                    link="/contratos",
                    payload={
                        "obra_id": c.get("obra_id"),
                        "contract_id": contract_id,
                        "via": "reenvio_acesso",
                    },
                )
                enviados_autor += 1
            except Exception as e:
                erros.append({"contract_id": contract_id, "destino": "autor", "erro": repr(e)})

    print("\n=== RESUMO ===")
    print(f"  contratos varridos          : {len(contratos)}")
    print(f"  notificações p/ editoras    : {enviados_publisher}")
    print(f"  notificações p/ autores     : {enviados_autor}")
    print(f"  erros                       : {len(erros)}")
    if erros:
        for e in erros:
            print(f"  - contrato={e['contract_id']} destino={e['destino']} {e['erro']}")


if __name__ == "__main__":
    main()
