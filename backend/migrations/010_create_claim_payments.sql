CREATE TABLE IF NOT EXISTS claim_payments (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id     UUID        NOT NULL REFERENCES claim_stages(id) ON DELETE CASCADE,
    claim_id     UUID        NOT NULL REFERENCES claims(id) ON DELETE CASCADE,  -- denormalized for fast queries
    amount       NUMERIC(15,2) NOT NULL DEFAULT 0,                              -- importe_pago
    payment_date TIMESTAMPTZ NOT NULL,                                          -- fecha_pago
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claim_payments_stage_id  ON claim_payments(stage_id);
CREATE INDEX IF NOT EXISTS idx_claim_payments_claim_id  ON claim_payments(claim_id);
