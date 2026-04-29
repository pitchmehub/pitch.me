-- ══════════════════════════════════════════════════════════════════
-- Gravan — Migração: adiciona 'editora_detentora' ao signers_role_check
--
-- CONTEXTO:
--   O backend gera contratos bilaterais onde a Gravan atua como
--   EDITORA DETENTORA DOS DIREITOS e precisa ser inserida como
--   signatária com role='editora_detentora'. A constraint atual não
--   inclui esse valor, fazendo o insert falhar com código 23514.
--
-- COMO EXECUTAR:
--   Cole no SQL Editor do Supabase e clique em RUN.
--   Idempotente — seguro rodar múltiplas vezes.
-- ══════════════════════════════════════════════════════════════════

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
    'editora_terceira',
    'editora_detentora'
  ));
