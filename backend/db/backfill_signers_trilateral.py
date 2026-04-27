"""
Backfill de signers para contratos trilaterais que foram criados
mas tiveram o INSERT em contract_signers rejeitado pelo CHECK
constraint antigo (signers_role_check sem 'editora_agregadora').

Pré-requisito: rodar antes a SQL `migration_signers_role_publisher.sql`
no SQL Editor do Supabase.

USO:
    cd backend && python db/backfill_signers_trilateral.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from db.supabase_client import get_supabase  # noqa: E402


def backfill() -> None:
    sb = get_supabase()

    # 1) Contratos trilaterais
    contratos = (
        sb.table("contracts")
        .select("id, obra_id, seller_id, buyer_id, valor_cents, status, trilateral, created_at")
        .eq("trilateral", True)
        .order("created_at", desc=False)
        .execute()
        .data
        or []
    )
    if not contratos:
        print("Nenhum contrato trilateral encontrado.")
        return

    cids = [c["id"] for c in contratos]
    signers_ja = (
        sb.table("contract_signers").select("contract_id").in_("contract_id", cids).execute().data
        or []
    )
    com_signers = {s["contract_id"] for s in signers_ja}
    quebrados = [c for c in contratos if c["id"] not in com_signers]

    print(f"Contratos trilaterais: {len(contratos)}")
    print(f"Já com signers:        {len(com_signers)}")
    print(f"Para backfill:         {len(quebrados)}")

    if not quebrados:
        return

    ok, falhou = 0, 0
    for c in quebrados:
        cid = c["id"]
        obra_id = c["obra_id"]
        seller_id = c["seller_id"]
        buyer_id = c["buyer_id"]

        # titular = seller; pega editora-mãe via perfis.publisher_id
        perfil = (
            sb.table("perfis").select("id, publisher_id").eq("id", seller_id).single().execute().data
        )
        if not perfil:
            print(f"  [skip] {cid[:8]}.. seller perfil não encontrado")
            falhou += 1
            continue

        editora_id = perfil.get("publisher_id")
        if not editora_id:
            print(f"  [skip] {cid[:8]}.. seller {seller_id[:8]}.. já não tem publisher_id (saiu da editora?)")
            falhou += 1
            continue

        # coautores ativos da obra
        coaut = (
            sb.table("coautoria_obras")
            .select("perfil_id, share_pct, status")
            .eq("obra_id", obra_id)
            .eq("status", "aceito")
            .execute()
            .data
            or []
        )
        # garantir que titular esteja na lista (autor principal)
        if not any(x["perfil_id"] == seller_id for x in coaut):
            coaut.insert(0, {"perfil_id": seller_id, "share_pct": 100.0, "status": "aceito"})

        # ordena: titular primeiro (autor), demais coautor
        ordered = sorted(coaut, key=lambda x: 0 if x["perfil_id"] == seller_id else 1)

        signers = []
        for x in ordered:
            signers.append({
                "contract_id": cid,
                "user_id":     x["perfil_id"],
                "role":        "autor" if x["perfil_id"] == seller_id else "coautor",
                "share_pct":   float(x["share_pct"]),
            })
        signers.append({
            "contract_id": cid,
            "user_id":     editora_id,
            "role":        "editora_agregadora",
            "share_pct":   None,
        })
        signers.append({
            "contract_id": cid,
            "user_id":     buyer_id,
            "role":        "interprete",
            "share_pct":   None,
        })

        try:
            sb.table("contract_signers").insert(signers).execute()
            try:
                sb.table("contract_events").insert({
                    "contract_id": cid,
                    "event_type":  "signers_backfill",
                    "payload":     {"qtd": len(signers)},
                }).execute()
            except Exception:
                pass
            print(f"  [ok]  {cid[:8]}.. inseriu {len(signers)} signers (editora={editora_id[:8]}..)")
            ok += 1
        except Exception as e:
            print(f"  [erro] {cid[:8]}.. {e}")
            falhou += 1

    print(f"\nResultado: ok={ok} falhou={falhou}")


if __name__ == "__main__":
    backfill()
