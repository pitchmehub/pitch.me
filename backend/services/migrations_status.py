"""
Verifica quais migrações SQL já foram aplicadas no banco (Supabase).

Cada migração tem um "probe" — uma função leve que tenta consultar uma
tabela/coluna criada pela migração. Se a consulta funciona, a migração
está aplicada; se levanta erro de "relation does not exist" ou "column
does not exist", está pendente.
"""
from db.supabase_client import get_supabase


def _probe_table(table: str, columns: str) -> tuple[str, str | None]:
    """Tenta um SELECT mínimo. Retorna ('applied', None) ou ('missing', erro)."""
    try:
        get_supabase().table(table).select(columns).limit(1).execute()
        return ("applied", None)
    except Exception as e:
        msg = str(e)
        low = msg.lower()
        if (
            "does not exist" in low
            or "could not find the table" in low
            or "could not find the 'public.'" in low
            or "pgrst205" in low
            or "pgrst204" in low
            or "42p01" in low
            or "42703" in low
        ):
            return ("missing", msg[:200])
        return ("unknown", msg[:200])


# ─────────────────────────────────────────────────────────────────────
# Catálogo de migrações conhecidas + como detectar cada uma.
# Adicione aqui qualquer migração nova que queira monitorar.
# ─────────────────────────────────────────────────────────────────────
MIGRATIONS = [
    {
        "id": "notificacoes_base",
        "file": "sql/01_criar_tabela_notificacoes.sql",
        "title": "Tabela base de notificações",
        "probe": lambda: _probe_table("notificacoes", "id,perfil_id,lida,lida_em"),
    },
    {
        "id": "notificacoes_realtime",
        "file": "backend/db/migration_realtime_notificacoes.sql",
        "title": "Realtime na tabela notificacoes (sino ao vivo)",
        # Não dá pra checar pg_publication_tables via PostgREST.
        # Pelo menos confirmamos que a tabela base existe.
        "probe": lambda: _probe_table("notificacoes", "id"),
        "manual_note": (
            "Checagem completa só no Dashboard do Supabase: "
            "Database → Replication → confirmar que a tabela `notificacoes` "
            "está ativa na publicação `supabase_realtime`."
        ),
    },
    {
        "id": "push_subscriptions",
        "file": "backend/db/migration_push_subscriptions.sql",
        "title": "Tabela push_subscriptions (Web Push / VAPID)",
        "probe": lambda: _probe_table(
            "push_subscriptions", "id,perfil_id,endpoint,p256dh,auth_key"
        ),
    },
    {
        "id": "agregado_convites",
        "file": "backend/db/migration_agregado_convites.sql",
        "title": "Convites de agregado (editora ↔ artista)",
        "probe": lambda: _probe_table(
            "agregado_convites",
            "id,editora_id,email_artista,modo,status,token,termo_html",
        ),
    },
]


def status_all() -> list[dict]:
    """Retorna o status de todas as migrações conhecidas."""
    out = []
    for m in MIGRATIONS:
        status, error = m["probe"]()
        item = {
            "id": m["id"],
            "file": m["file"],
            "title": m["title"],
            "status": status,  # 'applied' | 'missing' | 'unknown'
            "error": error,
        }
        if m.get("manual_note"):
            item["manual_note"] = m["manual_note"]
        out.append(item)
    return out


def summary() -> dict:
    items = status_all()
    return {
        "items": items,
        "total": len(items),
        "applied": sum(1 for i in items if i["status"] == "applied"),
        "missing": sum(1 for i in items if i["status"] == "missing"),
        "unknown": sum(1 for i in items if i["status"] == "unknown"),
    }
