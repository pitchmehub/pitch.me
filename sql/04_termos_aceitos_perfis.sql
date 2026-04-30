-- ============================================================
-- Aceite de Termos de Uso no perfil
--   - termos_aceitos      : booleano (true quando o usuário aceitou)
--   - termos_aceitos_em   : timestamp UTC do aceite
--   - termos_versao       : versão dos Termos vigente no momento do aceite
--   - termos_aceitos_ip   : IP de origem (auditoria probatória)
-- Idempotente: só adiciona colunas que ainda não existem.
-- ============================================================

ALTER TABLE perfis ADD COLUMN IF NOT EXISTS termos_aceitos     BOOLEAN     NOT NULL DEFAULT FALSE;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS termos_aceitos_em  TIMESTAMPTZ;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS termos_versao      TEXT;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS termos_aceitos_ip  TEXT;

-- Índice para auditorias por versão de termos
CREATE INDEX IF NOT EXISTS idx_perfis_termos_versao ON perfis (termos_versao);
