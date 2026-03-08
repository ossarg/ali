-- Agrega título y descripción generados por Rachel (LLM) a cada case_event
ALTER TABLE case_events
    ADD COLUMN IF NOT EXISTS title       VARCHAR(200),
    ADD COLUMN IF NOT EXISTS description TEXT;
