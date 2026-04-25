"""
Reprocessa as capas das obras existentes, persistindo no Supabase Storage.
Roda serialmente com pausa entre requisições para evitar 429 da Pollinations.

Uso:  cd backend && python scripts/backfill_capas.py
"""
import sys, os, secrets, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from db.supabase_client import get_supabase
from services.ai_capa import (
    gerar_url_capa,
    _baixar_imagem_pollinations,
    _upload_supabase,
)

def main():
    sb = get_supabase()
    obras = sb.table("obras").select("id, nome, genero, cover_url").execute().data or []
    pendentes = [
        o for o in obras
        if "supabase.co/storage" not in (o.get("cover_url") or "")
    ]

    print(f"Total obras: {len(obras)}  |  pendentes (sem URL Storage): {len(pendentes)}")
    ok = fb = 0
    for i, o in enumerate(pendentes, 1):
        seed = secrets.randbelow(10_000_000)
        poll_url = gerar_url_capa(o.get("nome") or "Música", o.get("genero") or "OUTROS", seed=seed)
        img = _baixar_imagem_pollinations(poll_url)
        final = _upload_supabase(o["id"], img) if img else None
        if final:
            ok += 1
            sb.table("obras").update({"cover_url": final}).eq("id", o["id"]).execute()
            print(f"  [{i:>2}/{len(pendentes)}] OK   {o['nome'][:30]}")
        else:
            fb += 1
            sb.table("obras").update({"cover_url": poll_url}).eq("id", o["id"]).execute()
            print(f"  [{i:>2}/{len(pendentes)}] FB   {o['nome'][:30]}")
        time.sleep(3)
    print(f"\n--- Resultado: Storage OK={ok}  Fallback={fb} ---")

if __name__ == "__main__":
    main()
