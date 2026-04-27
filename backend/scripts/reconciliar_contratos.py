"""
Script CLI para reconciliar contratos de edição faltantes.

Uso:
  cd backend && python scripts/reconciliar_contratos.py
  cd backend && python scripts/reconciliar_contratos.py --silencioso   # não notifica editoras

Pode ser executado quantas vezes quiser — é idempotente.
"""
import sys
import os
import json

# Garante que o pacote backend é importável quando rodando direto
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from services.reconciliar_contratos import reconciliar  # noqa: E402


def main():
    notificar = "--silencioso" not in sys.argv
    print(f"[reconciliar_contratos] iniciando (notificar={notificar})…")
    resultado = reconciliar(notificar=notificar)

    print("\n=== RESUMO ===")
    print(f"  obras analisadas      : {resultado['obras_analisadas']}")
    print(f"  já tinham contrato    : {resultado['ja_tinham_contrato']}")
    print(f"  contratos criados     : {resultado['contratos_criados']}")
    print(f"  erros                 : {len(resultado['erros'])}")

    if resultado["criados"]:
        print("\nContratos criados:")
        for c in resultado["criados"]:
            print(f"  - obra={c['obra_id']} ({c.get('obra_nome') or '—'}) "
                  f"→ contract={c['contract_id']} (publisher={c['publisher_id']})")

    if resultado["erros"]:
        print("\nErros:")
        for e in resultado["erros"]:
            print(f"  - obra={e['obra_id']}  {e['erro']}")

    print("\nJSON completo:")
    print(json.dumps(resultado, indent=2, default=str))


if __name__ == "__main__":
    main()
