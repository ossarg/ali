CREATE TABLE IF NOT EXISTS claim_stages (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id          UUID        NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    sise_stage_number INT         NOT NULL,                         -- nro_subreclamo
    status            VARCHAR(50) NOT NULL,                         -- estado SISE (RECHAZO, MEDIACION, JUICIO, etc.)
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (claim_id, sise_stage_number)
);

CREATE INDEX IF NOT EXISTS idx_claim_stages_claim_id ON claim_stages(claim_id);
