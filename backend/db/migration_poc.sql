-- ============================================================
-- MIGRACIÓN PoC — Libra Legal AI
-- Extiende el schema de Rachel sin romper lo existente
-- ⚠️  Requiere aprobación de Nacho antes de ejecutar en producción
-- ============================================================

-- Resultados de triage por caso
CREATE TABLE IF NOT EXISTS triage_results (
    id              SERIAL PRIMARY KEY,
    caso_id         INTEGER REFERENCES casos(id) ON DELETE CASCADE,
    relevancia      VARCHAR(10) NOT NULL CHECK (relevancia IN ('Alta', 'Media', 'Baja')),
    relevancia_humana VARCHAR(10) CHECK (relevancia_humana IN ('Alta', 'Media', 'Baja')),
    score_monto     NUMERIC(4,1),
    score_tipo      VARCHAR(10),
    score_complejidad NUMERIC(4,1),
    justificacion   TEXT,
    flags           JSONB DEFAULT '[]',
    confidence      NUMERIC(3,2),
    requiere_revision_humana BOOLEAN DEFAULT FALSE,
    motivo_revision TEXT,
    revisado_por    VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Calibración de triage (delta humano vs. agente)
CREATE TABLE IF NOT EXISTS triage_calibration (
    id                    SERIAL PRIMARY KEY,
    caso_id               INTEGER REFERENCES casos(id),
    relevancia_original   VARCHAR(10),
    relevancia_confirmada VARCHAR(10),
    revisado_por          VARCHAR(100),
    notas                 TEXT,
    created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Reglas de triage editables por gerente (versionadas)
CREATE TABLE IF NOT EXISTS triage_rules (
    id          SERIAL PRIMARY KEY,
    rules       JSONB NOT NULL,
    updated_by  VARCHAR(100),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline stage tracking por caso
ALTER TABLE casos ADD COLUMN IF NOT EXISTS pipeline_stage VARCHAR(50) DEFAULT 'ingesta';
ALTER TABLE casos ADD COLUMN IF NOT EXISTS pipeline_source VARCHAR(50) DEFAULT 'mail'; -- mail | pdf | test
ALTER TABLE casos ADD COLUMN IF NOT EXISTS pipeline_updated_at TIMESTAMPTZ;

-- Índices
CREATE INDEX IF NOT EXISTS idx_triage_results_caso_id ON triage_results(caso_id);
CREATE INDEX IF NOT EXISTS idx_triage_results_relevancia ON triage_results(relevancia);
CREATE INDEX IF NOT EXISTS idx_casos_pipeline_stage ON casos(pipeline_stage);
