"""
Backfill dos contratos de licenciamento (bilateral, trilateral agregado e
trilateral editora terceira).

O que faz:
  1) Para cada contrato em `contracts`, garante que TODOS os signers
     necessários existam em `contract_signers` (autores/coautores, editora
     agregadora ou terceira quando aplicável, e o intérprete/comprador).
     Os signers que já existem são preservados — sem duplicar.
  2) Reenvia notificação in-app + Web Push para todas as partes do contrato,
     com link direto pra `/contratos/licenciamento/<id>`.

Idempotente — pode ser rodado múltiplas vezes.

Uso:
  cd backend && python scripts/backfill_contratos_licenciamento.py
  cd backend && python scripts/backfill_contratos_licenciamento.py --so-trilateral
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv()

from db.supabase_client import get_supabase  # noqa: E402
from services.notificacoes import notify  # noqa: E402


def _coautores(sb, obra_id, titular_id):
    coaut = sb.table("coautorias").select("perfil_id, share_pct").eq("obra_id", obra_id).execute().data or []
    if not coaut:
        coaut = [{"perfil_id": titular_id, "share_pct": 100}]
    return coaut


def _ensure_signer(sb, contract_id, user_id, role, share_pct, ja_signers):
    """Insere signer só se ainda não existe pra esse (contract, user)."""
    if not user_id:
        return False, "user_id vazio"
    if user_id in ja_signers:
        return False, "ja_existe"
    try:
        sb.table("contract_signers").insert({
            "contract_id": contract_id,
            "user_id":     user_id,
            "role":        role,
            "share_pct":   share_pct,
        }).execute()
        ja_signers.add(user_id)
        return True, "inserido"
    except Exception as e:
        return False, repr(e)


def main():
    so_trilateral = "--so-trilateral" in sys.argv
    sb = get_supabase()

    q = sb.table("contracts").select(
        "id, transacao_id, obra_id, seller_id, buyer_id, status, trilateral, oferta_id, completed_at, "
        "obras(nome)"
    ).order("created_at", desc=True)
    if so_trilateral:
        q = q.eq("trilateral", True)
    contratos = q.execute().data or []

    print(f"[backfill_contratos_licenciamento] contratos a processar: {len(contratos)} "
          f"(somente trilaterais={so_trilateral})")

    signers_inseridos = 0
    notificacoes_enviadas = 0
    erros = []

    for c in contratos:
        contract_id = c["id"]
        obra        = c.get("obras") or {}
        nome_obra   = obra.get("nome") or "—"
        seller_id   = c.get("seller_id")  # titular/autor principal
        buyer_id    = c.get("buyer_id")
        is_trilat   = bool(c.get("trilateral"))
        obra_id     = c.get("obra_id")

        # 1) Quem JÁ está em contract_signers?
        rows = sb.table("contract_signers").select("user_id").eq("contract_id", contract_id).execute().data or []
        ja_signers = {r["user_id"] for r in rows if r.get("user_id")}

        # 2) Coautorias da obra → autor principal + coautores
        coaut = _coautores(sb, obra_id, seller_id) if obra_id else []
        for ca in coaut:
            pid = ca["perfil_id"]
            role = "autor" if pid == seller_id else "coautor"
            ok, msg = _ensure_signer(sb, contract_id, pid, role, float(ca["share_pct"]), ja_signers)
            if ok:
                signers_inseridos += 1
            elif msg not in ("ja_existe", "user_id vazio"):
                erros.append({"contract_id": contract_id, "destino": f"signer_{role}", "erro": msg})

        # 3) Comprador (intérprete)
        ok, msg = _ensure_signer(sb, contract_id, buyer_id, "interprete", None, ja_signers)
        if ok:
            signers_inseridos += 1
        elif msg not in ("ja_existe", "user_id vazio"):
            erros.append({"contract_id": contract_id, "destino": "signer_interprete", "erro": msg})

        # 4) Editora — agregada ou terceira
        editora_id = None
        editora_role = None
        if is_trilat:
            if c.get("oferta_id"):
                # Trilateral via oferta editora terceira
                of = sb.table("ofertas_licenciamento").select("editora_terceira_id").eq("id", c["oferta_id"]).maybe_single().execute()
                of_d = (of.data if of else {}) or {}
                editora_id = of_d.get("editora_terceira_id")
                editora_role = "editora_terceira"
            else:
                # Trilateral por agregação → publisher_id do titular
                tit = sb.table("perfis").select("publisher_id").eq("id", seller_id).maybe_single().execute() if seller_id else None
                tit_d = (tit.data if tit else {}) or {}
                editora_id = tit_d.get("publisher_id")
                editora_role = "editora_agregadora"

            if editora_id:
                ok, msg = _ensure_signer(sb, contract_id, editora_id, editora_role, None, ja_signers)
                if ok:
                    signers_inseridos += 1
                elif msg not in ("ja_existe", "user_id vazio"):
                    erros.append({"contract_id": contract_id, "destino": f"signer_{editora_role}", "erro": msg})

        # 5) Reenvia notificação para TODAS as partes (autores + comprador + editora)
        destinatarios = set(ja_signers)  # já contém todos depois do passo 2-4
        link = f"/contratos/licenciamento/{contract_id}"
        status_ctr = c.get("status") or "pendente"
        if status_ctr == "concluido" or c.get("completed_at"):
            titulo = "Contrato de licenciamento concluído"
            mensagem = f'O contrato de licenciamento da obra "{nome_obra}" foi concluído e está disponível para consulta.'
            tipo = "contrato_concluido"
        else:
            titulo = "Contrato de licenciamento disponível"
            mensagem = f'O contrato de licenciamento da obra "{nome_obra}" está disponível para sua assinatura.'
            tipo = "contrato_pendente"

        for uid in destinatarios:
            try:
                notify(uid, tipo=tipo, titulo=titulo, mensagem=mensagem, link=link,
                       payload={"contract_id": contract_id, "obra_id": obra_id, "via": "backfill_licenciamento"})
                notificacoes_enviadas += 1
            except Exception as e:
                erros.append({"contract_id": contract_id, "destino": f"notify_{uid}", "erro": repr(e)})

    print("\n=== RESUMO ===")
    print(f"  contratos processados      : {len(contratos)}")
    print(f"  signers inseridos          : {signers_inseridos}")
    print(f"  notificações enviadas      : {notificacoes_enviadas}")
    print(f"  erros                      : {len(erros)}")
    if erros:
        for e in erros[:30]:
            print(f"  - contrato={e['contract_id']} destino={e['destino']} {e['erro']}")


if __name__ == "__main__":
    main()
