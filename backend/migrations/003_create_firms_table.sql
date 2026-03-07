-- firm_type: 1=defense, 2=plaintiff, 3=both
CREATE TABLE IF NOT EXISTS firms (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(255) NOT NULL,
    address    VARCHAR(500),
    phone      VARCHAR(50),
    email      VARCHAR(255),
    type       SMALLINT NOT NULL DEFAULT 3,
    is_active  BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_firms_deleted_at ON firms(deleted_at);
CREATE INDEX IF NOT EXISTS idx_firms_type ON firms(type);
