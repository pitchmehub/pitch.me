-- =====================================================================
-- Migração: capa gerada por IA + transcrição de letra (Whisper local)
-- Data: 2026-04-25
-- =====================================================================
-- Adiciona suporte a:
--   • cover_url        → URL da capa (gerada via Pollinations.ai)
--   • letra_status     → estado da transcrição automática
--                        ('pendente', 'transcrevendo', 'pronta', 'erro')
-- A coluna `letra` já existe na tabela e continua sendo usada.
-- =====================================================================

ALTER TABLE obras
  ADD COLUMN IF NOT EXISTS cover_url   text,
  ADD COLUMN IF NOT EXISTS letra_status text NOT NULL DEFAULT 'pendente'
    CHECK (letra_status IN ('pendente', 'transcrevendo', 'pronta', 'erro'));

CREATE INDEX IF NOT EXISTS idx_obras_letra_status ON obras (letra_status);
