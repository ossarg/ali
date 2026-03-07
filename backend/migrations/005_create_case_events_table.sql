-- mail_type: 1=sentencia, 2=reclamo_pago, 3=intimacion, 4=acuerdo, 5=embargo, 6=pericia, 7=oficio

CREATE TABLE IF NOT EXISTS case_events (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id           UUID NULL REFERENCES cases(id) ON DELETE SET NULL,

    -- Mail metadata
    mail_id           VARCHAR(255) NOT NULL UNIQUE,
    mail_provider     VARCHAR(50)  NOT NULL DEFAULT 'gmail',
    subject           VARCHAR(500),
    mail_type         SMALLINT     NOT NULL,
    confidence        NUMERIC(4,3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    reasoning         TEXT,

    -- Raw identifiers extracted by Rachel (unnormalized)
    raw_claim_number  VARCHAR(100),
    raw_policy        VARCHAR(100),
    raw_case_number   VARCHAR(100),
    raw_caratula      VARCHAR(500),

    processed         BOOLEAN   NOT NULL DEFAULT false,
    received_at       TIMESTAMP NOT NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_events_case_id         ON case_events(case_id);
CREATE INDEX IF NOT EXISTS idx_case_events_mail_type       ON case_events(mail_type);
CREATE INDEX IF NOT EXISTS idx_case_events_processed       ON case_events(processed);
CREATE INDEX IF NOT EXISTS idx_case_events_raw_claim       ON case_events(raw_claim_number);
CREATE INDEX IF NOT EXISTS idx_case_events_raw_policy      ON case_events(raw_policy);
CREATE INDEX IF NOT EXISTS idx_case_events_raw_case_number ON case_events(raw_case_number);
