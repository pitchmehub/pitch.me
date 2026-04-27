-- ══════════════════════════════════════════════════════════════════
-- Gravan — Migração: amplia signers_role_check para incluir
-- editora_agregadora e editora_terceira
--
-- CONTEXTO:
--   O constraint original (migration_licenciamento.sql) só permitia
--   ('autor','coautor','intérprete','interprete'). Quando o titular
--   de uma obra é AGREGADO de uma editora, o backend gera um contrato
--   trilateral e tenta inserir um signer com role='editora_agregadora'.
--   O insert era atômico (todos os signers de uma vez), então a
--   violação do CHECK fazia TODOS os signers do contrato falharem,
--   e por isso a editora (e até o autor) não viam o contrato no
--   painel mesmo após receberem a notificação.
--
-- COMO EXECUTAR:
--   Cole no SQL Editor do Supabase e clique em RUN.
--   Idempotente — seguro rodar múltiplas vezes.
-- ══════════════════════════════════════════════════════════════════

-- 1) Recria o constraint com os novos roles permitidos
alter table public.contract_signers
  drop constraint if exists signers_role_check;

alter table public.contract_signers
  add constraint signers_role_check
  check (role in (
    'autor',
    'coautor',
    'intérprete',
    'interprete',
    'editora_agregadora',
    'editora_terceira'
  ));
