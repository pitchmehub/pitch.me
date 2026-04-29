-- ══════════════════════════════════════════════════════════════════
-- Gravan — Migração: contract_signers role fix
--
-- PROBLEMA: 'editora_detentora' (role da Gravan como detentora dos
-- direitos em contratos bilaterais) não estava na signers_role_check.
-- Isso fazia o INSERT da Gravan falhar e usar 'editora_agregadora'
-- como fallback — causando ambiguidade com editoras parceiras reais.
--
-- CONSEQUÊNCIA: quando o contrato trilateral falhava e caía para
-- bilateral, a Gravan ficava registrada como 'editora_agregadora'
-- e o compositor podia assinar sozinho liberando o escrow sem
-- a editora parceira.
--
-- Idempotente — seguro rodar mais de uma vez.
-- ══════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- 1. Adiciona 'editora_detentora' ao signers_role_check
-- ────────────────────────────────────────────────────────────────
do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'signers_role_check'
  ) then
    alter table public.contract_signers drop constraint signers_role_check;
  end if;

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
end $$;

-- ────────────────────────────────────────────────────────────────
-- 2. Corrige linhas existentes com role='editora_agregadora'
--    onde user_id = Gravan (para que o histórico fique consistente)
-- ────────────────────────────────────────────────────────────────
update public.contract_signers
set role = 'editora_detentora'
where user_id = 'e96bd8af-dfb8-4bf1-9ba5-7746207269cd'
  and role    = 'editora_agregadora';

-- ────────────────────────────────────────────────────────────────
-- 3. Confirma resultado
-- ────────────────────────────────────────────────────────────────
select
  conname,
  pg_get_constraintdef(oid) as definicao
from pg_constraint
where conname = 'signers_role_check';
