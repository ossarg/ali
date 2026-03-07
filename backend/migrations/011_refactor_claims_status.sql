-- Remove stage-level fields from claims (now live in claim_stages / claim_payments)
-- Add current_status as a denormalized cache of the latest stage's status

ALTER TABLE claims
    ADD COLUMN IF NOT EXISTS current_status VARCHAR(50) NOT NULL DEFAULT '';

ALTER TABLE claims
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS estimated_amount,
    DROP COLUMN IF EXISTS paid_amount;

CREATE INDEX IF NOT EXISTS idx_claims_current_status ON claims(current_status);
