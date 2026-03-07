-- Claims (siniestros) — sourced from SISE, persisted for analytics
CREATE TABLE IF NOT EXISTS claims (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- SISE identifiers
    sise_claim_id           BIGINT      NOT NULL,               -- id_stro
    sise_id_pv              BIGINT      NOT NULL,               -- id_pv
    claim_number            BIGINT      NOT NULL,               -- Nro_siniestro
    claim_subnumber         BIGINT      NOT NULL DEFAULT 1,     -- nro_subreclamo
    policy_number           BIGINT      NOT NULL,               -- nro_poliza
    policy_endorsement      BIGINT      NOT NULL DEFAULT 0,     -- nro_endoso
    ramo_code               SMALLINT    NOT NULL,               -- codigo_ramo

    -- Claim data
    incident_date           TIMESTAMP   NOT NULL,               -- fecha_incurrido
    registration_date       TIMESTAMP   NOT NULL,               -- fecha_resgistro (typo is SISE's)
    notice_date             TIMESTAMP   NOT NULL,               -- fecha_aviso
    payment_date            TIMESTAMP   NULL,                   -- fecha_pago
    cause                   TEXT        NOT NULL DEFAULT '',    -- causa
    coverage                TEXT        NOT NULL DEFAULT '',    -- cobertura
    status                  VARCHAR(50) NOT NULL DEFAULT '',    -- estado (ABIERTO/CERRADO)
    estimated_amount        NUMERIC(15,2) NOT NULL DEFAULT 0,  -- importe_estimado
    paid_amount             NUMERIC(15,2) NOT NULL DEFAULT 0,  -- importe_pago

    -- Policyholder
    contratante             VARCHAR(200) NOT NULL DEFAULT '',   -- contratante_pagador
    doc_type                VARCHAR(20)  NOT NULL DEFAULT '',   -- tomador_tipo_doc
    doc_number              VARCHAR(30)  NOT NULL DEFAULT '',   -- tomador_doc

    -- Policy data (from PolicySummary)
    policy_type             VARCHAR(100) NOT NULL DEFAULT '',   -- Tipo_de_Poliza
    insured_amount          NUMERIC(15,6) NOT NULL DEFAULT 0,  -- Suma_Asegurada
    policy_valid_from       TIMESTAMP   NOT NULL,               -- Vigencia_Desde
    policy_valid_to         TIMESTAMP   NOT NULL,               -- Vigencia_Hasta
    commercial_product_code SMALLINT    NOT NULL DEFAULT 0,    -- cod_producto_com
    commercial_product      VARCHAR(200) NOT NULL DEFAULT '',   -- Producto_comercial

    -- Producer data (from Producer — excluding cod_baja and fec_baja)
    producer_code           INT         NOT NULL DEFAULT 0,    -- cod_agente
    producer_type_code      SMALLINT    NOT NULL DEFAULT 0,    -- cod_tipo_agente
    producer_group_code     SMALLINT    NOT NULL DEFAULT 0,    -- cod_grupo
    producer_status         VARCHAR(5)  NOT NULL DEFAULT '',   -- cod_estado (A = active)
    producer_name           VARCHAR(200) NOT NULL DEFAULT '',   -- nombre
    producer_type           VARCHAR(50)  NOT NULL DEFAULT '',   -- tipo_agente

    created_at              TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_claims_sise_claim_id ON claims(sise_claim_id);
CREATE INDEX IF NOT EXISTS idx_claims_claim_number       ON claims(claim_number);
CREATE INDEX IF NOT EXISTS idx_claims_policy_number      ON claims(policy_number);
CREATE INDEX IF NOT EXISTS idx_claims_status             ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_doc_number         ON claims(doc_number);
CREATE INDEX IF NOT EXISTS idx_claims_producer_code      ON claims(producer_code);
