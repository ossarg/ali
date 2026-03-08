-- Migration 015: soft delete support for case_events
ALTER TABLE case_events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_case_events_deleted_at ON case_events (deleted_at);
