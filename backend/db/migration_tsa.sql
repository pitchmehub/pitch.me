-- ═══════════════════════════════════════════════════════════════════
-- Migration: Carimbo de Tempo RFC 3161 (TSA) — Gravan
-- Aplique via Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- Coluna para o token TSR (DER base64) de cada parte no contrato de edição
ALTER TABLE public.contracts_edicao
  ADD COLUMN IF NOT EXISTS tsa_token_autor      TEXT,
  ADD COLUMN IF NOT EXISTS tsa_token_publisher  TEXT;

-- Coluna para o token TSR de cada signatário no contrato de licenciamento
ALTER TABLE public.contract_signers
  ADD COLUMN IF NOT EXISTS tsa_token  TEXT;

-- Índices (opcionais, para buscas futuras)
CREATE INDEX IF NOT EXISTS idx_contracts_edicao_tsa_autor
  ON public.contracts_edicao (tsa_token_autor)
  WHERE tsa_token_autor IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contract_signers_tsa
  ON public.contract_signers (tsa_token)
  WHERE tsa_token IS NOT NULL;
