-- Resolution status: 0=pending, 1=resolved, 2=unresolved
ALTER TABLE case_events
    ADD COLUMN IF NOT EXISTS resolution_status         SMALLINT     NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS resolution_error          TEXT         NULL,
    ADD COLUMN IF NOT EXISTS resolved_claim_id         UUID         NULL REFERENCES claims(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS corrected_claim_number    VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS correction_comment        TEXT         NULL;

CREATE INDEX IF NOT EXISTS idx_case_events_resolution_status ON case_events(resolution_status);
CREATE INDEX IF NOT EXISTS idx_case_events_resolved_claim_id ON case_events(resolved_claim_id);
