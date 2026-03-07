-- Add sise_status_id to claim_stages for proper status tracking
-- IDs sourced from SISE catalog:
-- 1=TERMINADO, 2=RECHAZO, 3=JUICIO, 4=ABIERTO, 5=MEDIACION

ALTER TABLE claim_stages
    ADD COLUMN IF NOT EXISTS sise_status_id SMALLINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_claim_stages_sise_status_id ON claim_stages(sise_status_id);
