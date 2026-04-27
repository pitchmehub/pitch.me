"""Diagnostica contratos trilaterais (agregado e editora terceira)."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv()
from db.supabase_client import get_supabase

sb = get_supabase()

print("=== TRANSAÇÕES CONFIRMADAS ===")
tx = sb.table("transacoes").select("id, obra_id, comprador_id, status, created_at").eq("status", "confirmada").order("created_at", desc=True).limit(50).execute().data or []
print(f"Total confirmadas: {len(tx)}")

print("\n=== CONTRACTS ===")
contracts = sb.table("contracts").select("id, transacao_id, obra_id, seller_id, buyer_id, status, trilateral, oferta_id, created_at").order("created_at", desc=True).limit(50).execute().data or []
print(f"Total contracts: {len(contracts)}")
trilaterais = [c for c in contracts if c.get("trilateral")]
bilaterais  = [c for c in contracts if not c.get("trilateral")]
print(f"  - bilaterais : {len(bilaterais)}")
print(f"  - trilaterais: {len(trilaterais)}")

# Mapear transações sem contrato
tx_ids_com_contrato = {c["transacao_id"] for c in contracts if c.get("transacao_id")}
tx_sem_contrato = [t for t in tx if t["id"] not in tx_ids_com_contrato]
print(f"\n  Transações confirmadas SEM contrato: {len(tx_sem_contrato)}")
for t in tx_sem_contrato[:10]:
    obra = sb.table("obras").select("nome, titular_id").eq("id", t["obra_id"]).maybe_single().execute()
    obra_d = (obra.data if obra else {}) or {}
    titular = sb.table("perfis").select("id, nome, publisher_id").eq("id", obra_d.get("titular_id")).maybe_single().execute() if obra_d.get("titular_id") else None
    titular_d = (titular.data if titular else {}) or {}
    print(f"   - tx={t['id']}  obra={obra_d.get('nome')!r}  titular={titular_d.get('nome')}  publisher_id={titular_d.get('publisher_id')}")

print("\n=== OBRAS COM TITULAR AGREGADO (publisher_id no perfil) ===")
perfis_pub = sb.table("perfis").select("id, nome, publisher_id").not_.is_("publisher_id", "null").execute().data or []
print(f"Perfis agregados: {len(perfis_pub)}")
for p in perfis_pub[:10]:
    print(f"  - perfil={p.get('nome')} (id={p['id']}) → publisher_id={p['publisher_id']}")

print("\n=== OFERTAS DE EDITORA TERCEIRA ===")
ofertas = sb.table("ofertas_licenciamento").select("id, obra_id, status, contrato_id, editora_terceira_email, editora_terceira_id, created_at").order("created_at", desc=True).limit(20).execute().data or []
print(f"Ofertas: {len(ofertas)}")
for o in ofertas:
    print(f"  - oferta={o['id']}  status={o.get('status')}  contrato_id={o.get('contrato_id')}  editora_id={o.get('editora_terceira_id')}  email={o.get('editora_terceira_email')}")

print("\n=== ÚLTIMOS EVENTOS DE CONTRATO ===")
events = sb.table("contract_events").select("contract_id, event_type, payload, created_at").order("created_at", desc=True).limit(20).execute().data or []
for e in events:
    pl = e.get("payload") or {}
    print(f"  {e['created_at']}  contract={e['contract_id']}  event={e['event_type']}  payload={json.dumps(pl, default=str)[:200]}")
