-- Migration 018: create agreements table
-- An agreement is created when a case_event of type acuerdo (mail_type=4) is approved.
-- One case/siniestro can have multiple agreements (lawyer fees, expert fees, insured payment, etc.)

CREATE TYPE agreement_type AS ENUM ('mediacion', 'juicio');
CREATE TYPE agreement_extraction_status AS ENUM ('pending', 'completed', 'failed');

CREATE TABLE agreements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Links
    case_event_id   UUID NOT NULL REFERENCES case_events(id) ON DELETE CASCADE,
    case_id         UUID REFERENCES cases(id) ON DELETE SET NULL,

    -- Core fields
    agreement_type          agreement_type,
    claim_number            TEXT,
    producer                TEXT,
    beneficiary             TEXT,
    concept                 TEXT,
    invoice_number          TEXT,
    amount                  NUMERIC(14, 2),
    due_date                DATE,

    -- Extraction metadata
    extraction_status       agreement_extraction_status NOT NULL DEFAULT 'pending',
    extraction_error        TEXT,
    extraction_raw          JSONB DEFAULT '{}',

    -- Timestamps
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX idx_agreements_case_event_id ON agreements(case_event_id);
CREATE INDEX idx_agreements_case_id       ON agreements(case_id);
CREATE INDEX idx_agreements_due_date      ON agreements(due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_agreements_deleted_at    ON agreements(deleted_at);
