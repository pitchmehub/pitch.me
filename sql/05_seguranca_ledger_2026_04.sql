-- ════════════════════════════════════════════════════════════════════
-- Migração 05 — Segurança + Ledger Fintech (2026-04)
-- ════════════════════════════════════════════════════════════════════
-- Aplique no SQL Editor do Supabase. Idempotente (pode rodar várias vezes).
--
-- Cobre 3 frentes:
--   A) Idempotência forte do webhook Stripe (item 7 do ledger)
--   B) Idempotência da venda por session_id (item 6 do ledger)
--   C) Proteção de dados bancários da Gravan na landing_content (item 1)
-- ════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────
-- A) IDEMPOTÊNCIA FORTE DO WEBHOOK STRIPE
--    Cada evento Stripe tem um id único (ex.: evt_1Nx...).
--    Inserimos o id ANTES de processar; se já existe, ignoramos.
--    Garante que webhook chegando 2× nunca duplica crédito.
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.stripe_events_processados (
  event_id      text        primary key,
  type          text,
  received_at   timestamptz not null default now(),
  processed_at  timestamptz,
  status        text        not null default 'recebido',  -- recebido | processado | erro
  erro_msg      text
);

alter table public.stripe_events_processados enable row level security;

do $$
begin
  -- Apenas service_role pode ler/escrever (webhook é backend-only)
  if not exists (
    select 1 from pg_policies
     where schemaname='public' and tablename='stripe_events_processados'
       and policyname='stripe_events_no_anon'
  ) then
    create policy "stripe_events_no_anon"
      on public.stripe_events_processados
      for all
      using (false)
      with check (false);
  end if;
end $$;

revoke all on public.stripe_events_processados from anon, authenticated;

create index if not exists idx_stripe_events_received
  on public.stripe_events_processados (received_at desc);


-- ─────────────────────────────────────────────────────────────────────
-- B) UNIQUE em transacoes(stripe_session_id)
--    Impede que duas linhas de venda apontem pra mesma sessão Stripe.
--    Combinado com (A), garante que mesmo sob race condition do webhook
--    o sistema só registra UMA venda por checkout.
-- ─────────────────────────────────────────────────────────────────────
do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema='public' and table_name='transacoes'
       and column_name='stripe_session_id'
  ) then
    if not exists (
      select 1 from pg_indexes
       where schemaname='public' and indexname='uq_transacoes_session'
    ) then
      execute 'create unique index uq_transacoes_session
                 on public.transacoes (stripe_session_id)
                 where stripe_session_id is not null';
    end if;
  end if;

  if exists (
    select 1 from information_schema.columns
     where table_schema='public' and table_name='transacoes'
       and column_name='stripe_payment_intent'
  ) then
    if not exists (
      select 1 from pg_indexes
       where schemaname='public' and indexname='uq_transacoes_pi'
    ) then
      execute 'create unique index uq_transacoes_pi
                 on public.transacoes (stripe_payment_intent)
                 where stripe_payment_intent is not null';
    end if;
  end if;
end $$;


-- ─────────────────────────────────────────────────────────────────────
-- C) PROTEÇÃO DE DADOS BANCÁRIOS DA GRAVAN
--    A tabela landing_content tem RLS pública para SELECT (correto pra
--    textos da landing). Mas algumas chaves contêm dados sensíveis:
--      gravan_banco, gravan_agencia, gravan_conta, gravan_titular,
--      gravan_cnpj, contrato_edicao_template (template com placeholders)
--
--    Movemos esses dados para uma tabela separada, SEM RLS pública,
--    e mantemos landing_content só para textos de marketing.
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.gravan_config (
  chave       text        primary key,
  valor       text        not null,
  updated_at  timestamptz not null default now()
);

alter table public.gravan_config enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname='public' and tablename='gravan_config'
       and policyname='gravan_config_no_anon'
  ) then
    create policy "gravan_config_no_anon"
      on public.gravan_config
      for all
      using (false)
      with check (false);
  end if;
end $$;

revoke all on public.gravan_config from anon, authenticated;

-- Migra qualquer dado bancário existente em landing_content para gravan_config
do $$
declare
  k text;
  sensitive_keys text[] := array[
    'gravan_banco','gravan_agencia','gravan_conta',
    'gravan_titular','gravan_cnpj','gravan_pix'
  ];
begin
  foreach k in array sensitive_keys loop
    insert into public.gravan_config (chave, valor)
    select k, valor from public.landing_content where id = k
    on conflict (chave) do update
      set valor = excluded.valor, updated_at = now();

    -- Remove de landing_content (público) qualquer linha com esses ids
    delete from public.landing_content where id = k;
  end loop;
end $$;


-- ─────────────────────────────────────────────────────────────────────
-- D) DEFENSE-IN-DEPTH: bloqueia leitura pública de qualquer chave
--    cujo id COMECE com 'gravan_' ou 'private_' na landing_content.
--    Mesmo que alguém insira por engano um campo bancário lá no
--    futuro, ele não vaza para o anon.
-- ─────────────────────────────────────────────────────────────────────
do $$
begin
  if exists (
    select 1 from pg_policies
     where schemaname='public' and tablename='landing_content'
       and policyname='landing_sel'
  ) then
    execute 'drop policy "landing_sel" on public.landing_content';
  end if;

  execute $P$
    create policy "landing_sel" on public.landing_content
      for select
      using (
        id is null
        or (
          left(id, 7)  <> 'gravan_'
          and left(id, 8)  <> 'private_'
          and id not in (
            'gravan_banco','gravan_agencia','gravan_conta',
            'gravan_titular','gravan_cnpj','gravan_pix'
          )
        )
      )
  $P$;
end $$;


-- ════════════════════════════════════════════════════════════════════
-- VERIFICAÇÃO FINAL
-- ════════════════════════════════════════════════════════════════════
select 'stripe_events_processados criada' as item,
       exists(select 1 from information_schema.tables
              where table_schema='public' and table_name='stripe_events_processados') as ok
union all
select 'gravan_config criada',
       exists(select 1 from information_schema.tables
              where table_schema='public' and table_name='gravan_config')
union all
select 'uq_transacoes_session existe',
       exists(select 1 from pg_indexes
              where schemaname='public' and indexname='uq_transacoes_session')
union all
select 'uq_transacoes_pi existe',
       exists(select 1 from pg_indexes
              where schemaname='public' and indexname='uq_transacoes_pi')
union all
select 'RLS landing_content bloqueia gravan_*',
       exists(select 1 from pg_policies
              where schemaname='public' and tablename='landing_content'
                and policyname='landing_sel'
                and qual like '%gravan_%');
