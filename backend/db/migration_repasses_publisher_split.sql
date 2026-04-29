-- ══════════════════════════════════════════════════════════════════
-- Gravan — Migração: Publisher Split Fix
--
-- 1. Adiciona status 'plataforma' ao check constraint de repasses
--    (reservado para rastreabilidade, mesmo sem Transfer Connect)
--
-- 2. Adiciona colunas share_pct e coautoria_id a pagamentos_compositores
--    (estavam faltando — sem elas, todos os INSERTs falhavam silenciosamente,
--     impedindo o registro de pagamentos de compositores e editoras parceiras)
--
-- Execute via Supabase SQL Editor.
-- Idempotente — seguro rodar mais de uma vez.
-- ══════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- 1. Adiciona 'plataforma' ao check constraint de repasses
-- ────────────────────────────────────────────────────────────────
do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'repasses_status_check'
  ) then
    alter table public.repasses drop constraint repasses_status_check;
  end if;

  alter table public.repasses
    add constraint repasses_status_check
    check (status in ('pendente', 'retido', 'enviado', 'falhou', 'revertido', 'plataforma'));
end $$;

-- ────────────────────────────────────────────────────────────────
-- 2. Colunas ausentes em pagamentos_compositores
--    share_pct    — percentual do split do compositor/editora
--    coautoria_id — FK para coautorias (opcional; NULL para editoras)
-- ────────────────────────────────────────────────────────────────
alter table public.pagamentos_compositores
  add column if not exists share_pct    numeric(6,3),
  add column if not exists coautoria_id uuid;

-- FK para coautorias (soft — só adiciona se a tabela existir e a coluna for nova)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pgto_coautoria_fk'
  ) and exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'coautorias'
  ) then
    alter table public.pagamentos_compositores
      add constraint pgto_coautoria_fk
      foreign key (coautoria_id) references public.coautorias(id) on delete set null;
  end if;
end $$;

-- ────────────────────────────────────────────────────────────────
-- 3. Confirma resultado
-- ────────────────────────────────────────────────────────────────
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name   = 'pagamentos_compositores'
order by ordinal_position;
