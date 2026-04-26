-- ============================================================================
-- Gravan · Migration consolidada (Fases 1 a 4)
-- Suporte a: ofertas com tipo (padrão / exclusividade), contrapropostas,
--            janela de 48h, exclusividade de 5 anos em obras.
-- ----------------------------------------------------------------------------
-- IDEMPOTENTE: pode rodar mais de uma vez sem quebrar nada.
-- IMPORTANTE: rode o arquivo INTEIRO de uma vez no SQL Editor do Supabase.
--             A Parte 1 NÃO pode ficar dentro de transação (limitação do
--             PostgreSQL para ALTER TYPE ... ADD VALUE).
-- ============================================================================


-- =========================================================================
-- PARTE 1 — ENUM `oferta_status`: adicionar valores novos
-- (FORA de transação por exigência do PostgreSQL.)
-- =========================================================================

ALTER TYPE public.oferta_status ADD VALUE IF NOT EXISTS 'contra_proposta';
ALTER TYPE public.oferta_status ADD VALUE IF NOT EXISTS 'cancelada';
ALTER TYPE public.oferta_status ADD VALUE IF NOT EXISTS 'paga';
ALTER TYPE public.oferta_status ADD VALUE IF NOT EXISTS 'expirada';


-- =========================================================================
-- PARTE 2 — Schema novo (em transação)
-- =========================================================================

BEGIN;

-- -------------------------------------------------------------------------
-- 2.1  Tabela `ofertas` — colunas novas
-- -------------------------------------------------------------------------

ALTER TABLE public.ofertas
  ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'padrao';

ALTER TABLE public.ofertas
  ADD COLUMN IF NOT EXISTS contraproposta_de_id UUID
    REFERENCES public.ofertas(id) ON DELETE SET NULL;

ALTER TABLE public.ofertas
  ADD COLUMN IF NOT EXISTS aguardando_resposta_de TEXT NOT NULL DEFAULT 'compositor';

ALTER TABLE public.ofertas
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ
    DEFAULT (now() + INTERVAL '48 hours');

ALTER TABLE public.ofertas
  ADD COLUMN IF NOT EXISTS mensagem TEXT;

ALTER TABLE public.ofertas
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- Garante valor de expiração para linhas antigas
UPDATE public.ofertas
   SET expires_at = created_at + INTERVAL '48 hours'
 WHERE expires_at IS NULL;

-- -------------------------------------------------------------------------
-- 2.2  CHECK constraints para as colunas TEXT novas
--      (status NÃO é check — é ENUM, já tratado na Parte 1.)
-- -------------------------------------------------------------------------

ALTER TABLE public.ofertas DROP CONSTRAINT IF EXISTS ofertas_tipo_check;
ALTER TABLE public.ofertas
  ADD CONSTRAINT ofertas_tipo_check
  CHECK (tipo IN ('padrao','exclusividade'));

ALTER TABLE public.ofertas DROP CONSTRAINT IF EXISTS ofertas_aguardando_check;
ALTER TABLE public.ofertas
  ADD CONSTRAINT ofertas_aguardando_check
  CHECK (aguardando_resposta_de IN ('compositor','interprete'));

-- -------------------------------------------------------------------------
-- 2.3  Tabela `obras` — flag de exclusividade
-- -------------------------------------------------------------------------

ALTER TABLE public.obras
  ADD COLUMN IF NOT EXISTS is_exclusive BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.obras
  ADD COLUMN IF NOT EXISTS exclusive_until TIMESTAMPTZ;

ALTER TABLE public.obras
  ADD COLUMN IF NOT EXISTS exclusive_to_id UUID
    REFERENCES public.perfis(id) ON DELETE SET NULL;

-- -------------------------------------------------------------------------
-- 2.4  Índices de performance
-- -------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_ofertas_obra_status
  ON public.ofertas (obra_id, status);

CREATE INDEX IF NOT EXISTS idx_ofertas_interprete_status
  ON public.ofertas (interprete_id, status);

CREATE INDEX IF NOT EXISTS idx_ofertas_pendentes_expirando
  ON public.ofertas (expires_at)
  WHERE status = 'pendente';

CREATE INDEX IF NOT EXISTS idx_ofertas_contraproposta_pai
  ON public.ofertas (contraproposta_de_id)
  WHERE contraproposta_de_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_obras_exclusivas
  ON public.obras (is_exclusive)
  WHERE is_exclusive = true;

CREATE INDEX IF NOT EXISTS idx_obras_exclusive_to
  ON public.obras (exclusive_to_id)
  WHERE exclusive_to_id IS NOT NULL;

COMMIT;

-- ============================================================================
-- FIM. Após rodar, o backend já passa a aceitar:
--   • POST   /api/catalogo/<obra_id>/ofertas        (tipo + valor + mensagem)
--   • PATCH  /api/catalogo/ofertas/<id>/responder
--   • POST   /api/catalogo/ofertas/<id>/contra-propor
--   • PATCH  /api/catalogo/ofertas/<id>/responder-contraproposta
--   • POST   /api/stripe/checkout  (com oferta_id, exclusividade aplicada
--                                    no webhook após pagamento confirmado)
-- ============================================================================
