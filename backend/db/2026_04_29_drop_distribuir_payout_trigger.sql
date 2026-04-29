-- ════════════════════════════════════════════════════════════════════════
-- 2026-04-29 — REMOVE trg_distribuir_payout (BUG DE ESCROW)
-- ════════════════════════════════════════════════════════════════════════
-- O trigger AFTER UPDATE em transacoes chamava distribuir_payout(), que
-- inseria pagamentos_compositores e creditava wallets assim que
-- status='confirmada' — IGNORANDO o status do contrato. Isso fazia os
-- autores receberem crédito ANTES de qualquer parte assinar (~50–80ms
-- após o webhook do Stripe, ~1s ANTES da criação do contrato).
--
-- O fluxo correto é: creditar SOMENTE em services.repasses
-- .creditar_wallets_por_transacao(), chamado por aceitar_contrato() após
-- a guarda _escrow_guard() validar que o contrato está 'concluido'.
-- Essa função já credita autores E editora com idempotência granular
-- (vide repasses.py linhas 282–299, 449–516).
--
-- IDEMPOTENTE: pode rodar quantas vezes for preciso.
-- ════════════════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS trg_distribuir_payout ON public.transacoes;
DROP FUNCTION IF EXISTS public.distribuir_payout();
