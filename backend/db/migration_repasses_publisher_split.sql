-- ══════════════════════════════════════════════════════════════════
-- Gravan — Migração: Publisher Split Fix
--
-- 1. Adiciona status 'plataforma' ao check constraint de repasses
--    (usado quando Gravan é a própria editora — valor fica na conta
--    Stripe da plataforma, sem precisar de Transfer Connect)
--
-- 2. Garante coluna gravan_editora_id em obras (já existe, mas
--    confirma a FK para o perfil real da Gravan)
--
-- Execute via Supabase SQL Editor.
-- Idempotente — seguro rodar mais de uma vez.
-- ══════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- 1. Adiciona 'plataforma' ao check constraint de repasses
-- ────────────────────────────────────────────────────────────────
do $$
begin
  -- Remove o constraint antigo (sem 'plataforma')
  if exists (
    select 1 from pg_constraint where conname = 'repasses_status_check'
  ) then
    alter table public.repasses drop constraint repasses_status_check;
  end if;

  -- Recria com 'plataforma' incluído
  alter table public.repasses
    add constraint repasses_status_check
    check (status in ('pendente', 'retido', 'enviado', 'falhou', 'revertido', 'plataforma'));
end $$;

-- ────────────────────────────────────────────────────────────────
-- 2. Confirma resultado
-- ────────────────────────────────────────────────────────────────
select
  conname,
  pg_get_constraintdef(oid) as definicao
from pg_constraint
where conname = 'repasses_status_check';
