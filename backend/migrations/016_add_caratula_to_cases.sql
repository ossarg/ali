-- Migration 016: add caratula field to cases (denormalized from case_events.raw_caratula)
ALTER TABLE cases ADD COLUMN IF NOT EXISTS caratula TEXT;
