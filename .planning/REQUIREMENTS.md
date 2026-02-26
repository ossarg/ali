# Requirements: Libra Legal AI

**Defined:** 2026-02-26
**Core Value:** Automatizar tareas operativas del flujo de litigios para reducir costos externos, mejorar tiempos y generar trazabilidad

## v1 Requirements

### Ingesta y Revisión Formal

- [ ] **ING-01**: El sistema recibe emails de la casilla de demandas y detecta nuevos mensajes
- [ ] **ING-02**: El sistema extrae el PDF adjunto del email de notificación
- [ ] **ING-03**: El sistema extrae el texto del documento mediante OCR
- [ ] **ING-04**: El sistema verifica formalidades procesales básicas (firma, partes, competencia)
- [ ] **ING-05**: El sistema señala irregularidades formales para revisión humana

### Extracción de Datos

- [ ] **EXT-01**: El sistema extrae el nombre del demandante
- [ ] **EXT-02**: El sistema extrae el nombre del demandado
- [ ] **EXT-03**: El sistema extrae la jurisdicción del tribunal
- [ ] **EXT-04**: El sistema extrae el nombre del tribunal
- [ ] **EXT-05**: El sistema extrae la instancia
- [ ] **EXT-06**: El sistema extrae el monto reclamado
- [ ] **EXT-07**: El sistema extrae la moneda
- [ ] **EXT-08**: El sistema extrae la fecha de notificación
- [ ] **EXT-09**: El sistema extrae el motivo de la demanda
- [ ] **EXT-10**: El sistema extrae el número de póliza
- [ ] **EXT-11**: El sistema extrae el tipo de siniestro
- [ ] **EXT-12**: El sistema extrae el plazo de contestación
- [ ] **EXT-13**: El sistema asigna confidence score por campo
- [ ] **EXT-14**: El sistema marca campos con baja confianza para validación humana

### Base de Datos

- [ ] **DB-01**: El sistema almacena datos extraídos en base de datos estructurada
- [ ] **DB-02**: La vista tabular permite filtrar por jurisdicción
- [ ] **DB-03**: La vista tabular permite filtrar por monto
- [ ] **DB-04**: La vista tabular permite filtrar por tipo de siniestro
- [ ] **DB-05**: La vista tabular permite filtrar por estado
- [ ] **DB-06**: La vista tabular permite filtrar por abogado asignado
- [ ] **DB-07**: La vista tabular permite filtrar por fecha
- [ ] **DB-08**: El sistema permite búsqueda full-text sobre contenido de demandas
- [ ] **DB-09**: El sistema permite exportar a CSV/Excel

### Triage

- [ ] **TRI-01**: El sistema clasifica demandas en niveles de prioridad (alta/media/baja)
- [ ] **TRI-02**: La clasificación considera monto reclamado
- [ ] **TRI-03**: La clasificación considera plazo de contestación
- [ ] **TRI-04**: La clasificación considera tipo de siniestro
- [ ] **TRI-05**: La clasificación considera jurisdicción
- [ ] **TRI-06**: El sistema genera resumen ejecutivo de 3-5 líneas
- [ ] **TRI-07**: Los parámetros de triage son configurables

### Asignación a Abogados

- [ ] **ASIG-01**: El sistema sugiere asignación basada en área de expertise
- [ ] **ASIG-02**: El sistema sugiere asignación basada en seniority relativo a complejidad
- [ ] **ASIG-03**: El sistema sugiere asignación basada en carga de trabajo actual
- [ ] **ASIG-04**: La asignación es sugerencia que requiere confirmación humana

## Out of Scope

| Feature | Reason |
|---------|--------|
| Generación automática de contestaciones | Seleccionado para v2 |
| Seguimiento de casos (SAIJ) | Seleccionado para v2 |
| Analytics y reporting | Seleccionado para v2 |
| Integración con sistemas internos | Pendiente de definición - зависимости |
| Generación de ficheo por caso | Seleccionado para v2 |
| Argumentación jurídica original | El sistema NO genera argumentación, solo borradores estandarizables |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ING-01 | Phase 1 | Pending |
| ING-02 | Phase 1 | Pending |
| ING-03 | Phase 1 | Pending |
| ING-04 | Phase 1 | Pending |
| ING-05 | Phase 1 | Pending |
| EXT-01 | Phase 1 | Pending |
| EXT-02 | Phase 1 | Pending |
| EXT-03 | Phase 1 | Pending |
| EXT-04 | Phase 1 | Pending |
| EXT-05 | Phase 1 | Pending |
| EXT-06 | Phase 1 | Pending |
| EXT-07 | Phase 1 | Pending |
| EXT-08 | Phase 1 | Pending |
| EXT-09 | Phase 1 | Pending |
| EXT-10 | Phase 1 | Pending |
| EXT-11 | Phase 1 | Pending |
| EXT-12 | Phase 1 | Pending |
| EXT-13 | Phase 1 | Pending |
| EXT-14 | Phase 1 | Pending |
| DB-01 | Phase 2 | Pending |
| DB-02 | Phase 2 | Pending |
| DB-03 | Phase 2 | Pending |
| DB-04 | Phase 2 | Pending |
| DB-05 | Phase 2 | Pending |
| DB-06 | Phase 2 | Pending |
| DB-07 | Phase 2 | Pending |
| DB-08 | Phase 2 | Pending |
| DB-09 | Phase 2 | Pending |
| TRI-01 | Phase 3 | Pending |
| TRI-02 | Phase 3 | Pending |
| TRI-03 | Phase 3 | Pending |
| TRI-04 | Phase 3 | Pending |
| TRI-05 | Phase 3 | Pending |
| TRI-06 | Phase 3 | Pending |
| TRI-07 | Phase 3 | Pending |
| ASIG-01 | Phase 4 | Pending |
| ASIG-02 | Phase 4 | Pending |
| ASIG-03 | Phase 4 | Pending |
| ASIG-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-26*
*Last updated: 2026-02-26 after initial definition*
