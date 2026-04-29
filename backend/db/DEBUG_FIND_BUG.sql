-- ════════════════════════════════════════════════════════════════
-- DEBUG: Cole isto no SQL Editor do Supabase para achar o trigger
-- que está creditando autores antes do contrato.
-- ════════════════════════════════════════════════════════════════

-- 1) Lista TODOS os triggers do schema public
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 2) Lista TODAS as funções PL/pgSQL que fazem INSERT em pagamentos_compositores
SELECT
  n.nspname AS schema,
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS source_code
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE pg_get_functiondef(p.oid) ILIKE '%pagamentos_compositores%'
   OR pg_get_functiondef(p.oid) ILIKE '%wallets%saldo%';

-- 3) Lista database webhooks do Supabase (se existirem)
SELECT * FROM supabase_functions.hooks;
