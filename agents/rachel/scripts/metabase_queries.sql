-- ============================================================
-- QUERIES METABASE - Legales Libra Seguros
-- ============================================================


-- ============================================================
-- 1. EMBARGOS ACTIVOS
-- ============================================================
SELECT
    c.nro_siniestro                         AS "Siniestro",
    c.caratula                              AS "Carátula",
    e.entidad                               AS "Banco / Entidad",
    e.cuit_entidad                          AS "CUIT Entidad",
    TO_CHAR(e.monto_total, 'FM$999,999,999.99')  AS "Monto Total",
    e.moneda                                AS "Moneda",
    TO_CHAR(e.fecha_oficio, 'DD/MM/YYYY')   AS "Fecha Oficio",
    e.estado                                AS "Estado",
    e.cuenta_deposito                       AS "CBU Depósito",
    est.nombre                              AS "Estudio"
FROM embargos e
JOIN casos c ON c.id = e.caso_id
LEFT JOIN estudios est ON est.id = c.estudio_id
ORDER BY e.fecha_oficio DESC;


-- ============================================================
-- 2A. PAGOS VENCIDOS (fecha_vencimiento < HOY)
-- ============================================================
SELECT
    c.nro_siniestro                                     AS "Siniestro",
    c.caratula                                          AS "Carátula",
    a.tipo                                              AS "Tipo",
    a.descripcion                                       AS "Descripción",
    TO_CHAR(a.fecha_vencimiento, 'DD/MM/YYYY')          AS "Fecha Vencimiento",
    CURRENT_DATE - a.fecha_vencimiento                  AS "Días Vencido",
    a.prioridad                                         AS "Prioridad",
    a.estado                                            AS "Estado",
    est.nombre                                          AS "Estudio"
FROM alertas a
JOIN casos c ON c.id = a.caso_id
LEFT JOIN estudios est ON est.id = c.estudio_id
WHERE a.fecha_vencimiento < CURRENT_DATE
  AND a.estado != 'resuelta'
ORDER BY a.fecha_vencimiento ASC;


-- ============================================================
-- 2B. PAGOS FUTUROS / PRÓXIMOS (fecha_vencimiento >= HOY)
-- ============================================================
SELECT
    c.nro_siniestro                                     AS "Siniestro",
    c.caratula                                          AS "Carátula",
    a.tipo                                              AS "Tipo",
    a.descripcion                                       AS "Descripción",
    TO_CHAR(a.fecha_vencimiento, 'DD/MM/YYYY')          AS "Fecha Vencimiento",
    a.fecha_vencimiento - CURRENT_DATE                  AS "Días Restantes",
    a.prioridad                                         AS "Prioridad",
    a.estado                                            AS "Estado",
    est.nombre                                          AS "Estudio"
FROM alertas a
JOIN casos c ON c.id = a.caso_id
LEFT JOIN estudios est ON est.id = c.estudio_id
WHERE (a.fecha_vencimiento >= CURRENT_DATE OR a.fecha_vencimiento IS NULL)
  AND a.estado != 'resuelta'
ORDER BY a.fecha_vencimiento ASC NULLS LAST;


-- ============================================================
-- 3. ALERTAS ACTIVAS
-- ============================================================
SELECT
    c.nro_siniestro                             AS "Siniestro",
    c.caratula                                  AS "Carátula",
    a.tipo                                      AS "Tipo Alerta",
    a.descripcion                               AS "Descripción",
    a.prioridad                                 AS "Prioridad",
    TO_CHAR(a.fecha_vencimiento, 'DD/MM/YYYY')  AS "Vencimiento",
    CASE
        WHEN a.fecha_vencimiento < CURRENT_DATE THEN 'VENCIDO'
        WHEN a.fecha_vencimiento = CURRENT_DATE THEN 'HOY'
        WHEN a.fecha_vencimiento <= CURRENT_DATE + 7 THEN 'ESTA SEMANA'
        ELSE 'PRÓXIMO'
    END                                         AS "Urgencia",
    a.estado                                    AS "Estado",
    est.nombre                                  AS "Estudio"
FROM alertas a
JOIN casos c ON c.id = a.caso_id
LEFT JOIN estudios est ON est.id = c.estudio_id
WHERE a.estado != 'resuelta'
ORDER BY
    CASE a.prioridad WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END,
    a.fecha_vencimiento ASC NULLS LAST;


-- ============================================================
-- 4. COLA DE REVISIÓN HUMANA
-- ============================================================
SELECT
    r.id                                        AS "ID Revisión",
    c.nro_siniestro                             AS "Siniestro",
    c.caratula                                  AS "Carátula",
    r.tipo_revision                             AS "Tipo",
    r.descripcion                               AS "Qué revisar",
    r.estado                                    AS "Estado",
    TO_CHAR(r.created_at, 'DD/MM/YYYY HH24:MI') AS "Fecha Ingreso",
    r.resuelto_por                              AS "Resuelto por",
    r.resolucion                                AS "Resolución"
FROM revision_queue r
JOIN casos c ON c.id = r.caso_id
ORDER BY
    CASE r.estado WHEN 'pendiente' THEN 1 WHEN 'en_revision' THEN 2 ELSE 3 END,
    r.created_at ASC;


-- ============================================================
-- 5. PERFORMANCE DE ESTUDIOS
-- ============================================================
SELECT
    est.nombre                                              AS "Estudio",
    COUNT(DISTINCT c.id)                                    AS "Total Casos",
    COUNT(DISTINCT CASE WHEN c.estado_actual = 'cerrado' THEN c.id END) AS "Casos Cerrados",
    COUNT(DISTINCT CASE WHEN c.estado_actual = 'abierto' THEN c.id END)  AS "Casos Activos",
    TO_CHAR(COALESCE(SUM(a.monto_estimado_sentencia), 0), 'FM$999,999,999')  AS "Total Estimado",
    TO_CHAR(COALESCE(SUM(a.monto_total), 0), 'FM$999,999,999')              AS "Total Acordado",
    CASE
        WHEN SUM(a.monto_estimado_sentencia) > 0
        THEN ROUND((1 - SUM(a.monto_total) / SUM(a.monto_estimado_sentencia)) * 100, 1)::TEXT || '%'
        ELSE '-'
    END                                                     AS "% Ahorro",
    COUNT(DISTINCT emb.id)                                  AS "Embargos Totales",
    COUNT(DISTINCT CASE WHEN emb.estado = 'trabado' THEN emb.id END) AS "Embargos Activos"
FROM estudios est
LEFT JOIN casos c ON c.estudio_id = est.id
LEFT JOIN acuerdos a ON a.caso_id = c.id
LEFT JOIN embargos emb ON emb.caso_id = c.id
GROUP BY est.id, est.nombre
ORDER BY COUNT(DISTINCT c.id) DESC;


-- ============================================================
-- 6. CASOS POR ESTADO
-- ============================================================
SELECT
    c.nro_siniestro                             AS "Siniestro",
    c.caratula                                  AS "Carátula",
    c.tipo_grupo                                AS "Grupo",
    c.tipo_accion                               AS "Tipo Acción",
    c.estado_actual                             AS "Estado",
    est.nombre                                  AS "Estudio",
    c.tribunal                                  AS "Tribunal",
    TO_CHAR(c.fecha_apertura, 'DD/MM/YYYY')     AS "Apertura",
    (SELECT ev.tipo FROM eventos ev WHERE ev.caso_id = c.id ORDER BY ev.fecha_evento DESC LIMIT 1) AS "Último Evento",
    (SELECT TO_CHAR(ev.fecha_evento, 'DD/MM/YYYY') FROM eventos ev WHERE ev.caso_id = c.id ORDER BY ev.fecha_evento DESC LIMIT 1) AS "Fecha Último Evento",
    (SELECT COUNT(*) FROM alertas al WHERE al.caso_id = c.id AND al.estado != 'resuelta') AS "Alertas Activas"
FROM casos c
LEFT JOIN estudios est ON est.id = c.estudio_id
ORDER BY
    (SELECT COUNT(*) FROM alertas al WHERE al.caso_id = c.id AND al.estado != 'resuelta') DESC,
    c.nro_siniestro;
