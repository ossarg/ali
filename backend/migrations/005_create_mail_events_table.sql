-- mail_type: 1=sentencia, 2=reclamo_pago, 3=intimacion, 4=acuerdo, 5=embargo, 6=pericia, 7=oficio

CREATE TABLE IF NOT EXISTS mail_events (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mail_id       VARCHAR(255) NOT NULL UNIQUE,
    mail_provider VARCHAR(50)  NOT NULL DEFAULT 'gmail',
    subject       VARCHAR(500),
    mail_type     SMALLINT     NOT NULL,
    confidence    NUMERIC(4,3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    reasoning     TEXT,
    processed     BOOLEAN      NOT NULL DEFAULT false,
    received_at   TIMESTAMP    NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mail_events_mail_type  ON mail_events(mail_type);
CREATE INDEX IF NOT EXISTS idx_mail_events_processed  ON mail_events(processed);
CREATE INDEX IF NOT EXISTS idx_mail_events_received_at ON mail_events(received_at);
