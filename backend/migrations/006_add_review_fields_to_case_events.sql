ALTER TABLE case_events
    ADD COLUMN IF NOT EXISTS approved             BOOLEAN   NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS original_mail_type   SMALLINT  NULL,
    ADD COLUMN IF NOT EXISTS reviewed_by          UUID      NULL REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reviewed_at          TIMESTAMP NULL,
    ADD COLUMN IF NOT EXISTS review_comment       TEXT      NULL;

CREATE INDEX IF NOT EXISTS idx_case_events_approved    ON case_events(approved);
CREATE INDEX IF NOT EXISTS idx_case_events_reviewed_by ON case_events(reviewed_by);
