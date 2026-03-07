-- case_type:    1=lawsuit, 2=mediation, 3=third_party
-- action_type:  1=direct_claim, 2=guarantee_citation (nullable — only for case_type=1)
-- status:       1=open, 2=closed, 3=suspended
-- pipeline_stage: 1=ingesta, 2=extraccion, 3=triage, 4=asignado, 5=borrador, 6=completado

CREATE TABLE IF NOT EXISTS cases (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_number       VARCHAR(100),
    case_number        VARCHAR(100),
    title              VARCHAR(500) NOT NULL,
    policy             VARCHAR(100),
    case_type          SMALLINT NOT NULL,
    action_type        SMALLINT NULL,
    court              VARCHAR(255),
    tribunal           VARCHAR(255),
    defense_firm_id    UUID NULL REFERENCES firms(id) ON DELETE SET NULL,
    plaintiff_firm_id  UUID NULL REFERENCES firms(id) ON DELETE SET NULL,
    assigned_user_id   UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    status             SMALLINT NOT NULL DEFAULT 1,
    estimated_amount   NUMERIC(15,2),
    incident_date      DATE,
    opened_at          TIMESTAMP,
    pipeline_stage     SMALLINT NOT NULL DEFAULT 1,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at         TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_cases_deleted_at       ON cases(deleted_at);
CREATE INDEX IF NOT EXISTS idx_cases_status           ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_pipeline_stage ON cases(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_user_id ON cases(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_cases_case_type        ON cases(case_type);
