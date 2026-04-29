-- ══════════════════════════════════════════════════════════════════
-- Gravan — Migração: contract_signers role fix
--
-- Regra de negócio:
--   • Compositor SEM editora parceira → Gravan = 'editora_detentora'
--   • Compositor COM editora parceira → editora parceira = 'editora_detentora'
--
-- PROBLEMA 1: 'editora_detentora' não estava na signers_role_check.
--   O INSERT da Gravan sempre falhava e usava 'editora_agregadora' como
--   fallback, criando ambiguidade com editoras parceiras reais.
--
-- PROBLEMA 2: Em contratos trilaterais, a editora parceira era inserida
--   como 'editora_agregadora' em vez de 'editora_detentora'.
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
-- 2. Corrige Gravan: role='editora_agregadora' → 'editora_detentora'
--    (linhas onde Gravan ficou com role errado por causa da constraint
--    antiga que não aceitava 'editora_detentora')
-- ────────────────────────────────────────────────────────────────
update public.contract_signers
set role = 'editora_detentora'
where user_id = 'e96bd8af-dfb8-4bf1-9ba5-7746207269cd'   -- GRAVAN_EDITORA_UUID
  and role    = 'editora_agregadora';

-- ────────────────────────────────────────────────────────────────
-- 3. Corrige editoras parceiras em contratos TRILATERAIS:
--    role='editora_agregadora' → 'editora_detentora'
--    (somente signers que NÃO são a Gravan, em contratos trilaterais)
-- ────────────────────────────────────────────────────────────────
update public.contract_signers
set role = 'editora_detentora'
where role = 'editora_agregadora'
  and user_id <> 'e96bd8af-dfb8-4bf1-9ba5-7746207269cd'
  and contract_id in (
    select id from public.contracts where trilateral = true
  );

-- ────────────────────────────────────────────────────────────────
-- 4. Confirma resultado
-- ────────────────────────────────────────────────────────────────
select conname, pg_get_constraintdef(oid) as definicao
from pg_constraint
where conname = 'signers_role_check';

select role, count(*) as total
from public.contract_signers
group by role
order by role;
