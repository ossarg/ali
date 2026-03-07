-- Link cases to claims (nullable — existing cases won't have a claim yet)
ALTER TABLE cases
    ADD COLUMN IF NOT EXISTS claim_id UUID NULL REFERENCES claims(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_cases_claim_id ON cases(claim_id);
