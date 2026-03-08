-- Agrega cuerpo limpio del mail y metadata de adjuntos a case_events
ALTER TABLE case_events
    ADD COLUMN IF NOT EXISTS body_clean  TEXT,
    ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]';
