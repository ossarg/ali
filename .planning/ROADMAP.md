# Roadmap: Libra Legal AI

**Project:** Libra Legal AI  
**Core Value:** Automatizar tareas operativas del flujo de litigios para reducir costos externos, mejorar tiempos y generar trazabilidad completa  
**Depth:** Quick (3-5 phases)  
**Last Updated:** 2026-02-26

---

## Overview

This roadmap delivers an AI-powered litigation case management system for Libra Seguros. The system automates the intake of legal demands (PDF), extracts structured data, stores it for retrieval, performs automatic triage/prioritization, and suggests lawyer assignments. All v1 requirements focus on the core ingestion-to-assignment workflow, with drafting, tracking, and analytics deferred to v2.

**Total Phases:** 4  
**Total Requirements:** 41

---

## Phase 1: Document Processing Pipeline

**Goal:** Email with demand notification arrives → system extracts PDF → structured data with confidence scores

### Requirements
- ING-01: El sistema recibe emails de la casilla de demandas y detecta nuevos mensajes
- ING-02: El sistema extrae el PDF adjunto del email de notificación
- ING-03: El sistema extrae el texto del documento mediante OCR
- ING-04: El sistema verifica formalidades procesales básicas
- ING-05: El sistema señala irregularidades formales para revisión humana
- EXT-01 al EXT-14: Extracción de todos los campos (demandante, demandado, tribunal, monto, póliza, etc.)

### Success Criteria

1. **Email Trigger:** System detects new email in inbox within 60 seconds and processes attachment
2. **Data Extraction:** All 12 key fields (demandante, demandado, jurisdicción, tribunal, instancia, monto, moneda, fecha notificación, motivo, póliza, tipo siniestro, plazo) are extracted and displayed
3. **Confidence Visibility:** Each extracted field shows a confidence score (high/medium/low)
4. **Low-Confidence Flagging:** Fields with confidence below threshold are visually marked for human review
5. **Formal Verification:** System flags missing/malformed elements (firma, partes, competencia) for manual review

### Dependencies
- None (foundation phase)

---

## Phase 2: Data Storage & Retrieval

**Goal:** Users can store, filter, search, and export processed demand data

### Requirements
- DB-01: Almacenamiento en base de datos estructurada
- DB-02 al DB-07: Filtros (jurisdicción, monto, tipo siniestro, estado, abogado, fecha)
- DB-08: Búsqueda full-text sobre contenido de demandas
- DB-09: Exportación a CSV/Excel

### Success Criteria

1. **Persistent Storage:** Uploaded demands persist across sessions in structured database
2. **Tabular View:** User sees all cases in sortable/filterable table format
3. **Multi-Filter:** User can apply multiple filters simultaneously (e.g., jurisdicción = Buenos Aires AND monto > 1M)
4. **Full-Text Search:** User can search by any text term appearing in demand content
5. **Export:** User can download filtered or full dataset as CSV or Excel file

### Dependencies
- Phase 1 (data extraction must work before storing)

---

## Phase 3: Triage & Prioritization

**Goal:** Users see auto-classified priority levels and executive summaries for each demand

### Requirements
- TRI-01 al TRI-05: Clasificación de prioridad basada en monto, plazo, tipo, jurisdicción
- TRI-06: Generación de resumen ejecutivo (3-5 líneas)
- TRI-07: Parámetros de triage configurables

### Success Criteria

1. **Priority Classification:** Each demand displays priority level (alta/media/baja) derived from rules engine
2. **Priority Factors:** User can see which factors contributed to priority (e.g., "Monto alto + Plazo corto")
3. **Executive Summary:** Each case shows 3-5 line summary of key facts
4. **Configurable Rules:** Admin can adjust weightings for monto, plazo, tipo, jurisdicción without code changes
5. **Dashboard View:** High-priority cases surface to top of case list

### Dependencies
- Phase 2 (needs stored data to classify)

---

## Phase 4: Lawyer Assignment

**Goal:** Users receive AI-suggested lawyer assignments based on expertise, complexity, and workload

### Requirements
- ASIG-01: Sugerencia basada en área de expertise
- ASIG-02: Sugerencia basada en seniority relativo a complejidad
- ASIG-03: Sugerencia basada en carga de trabajo actual
- ASIG-04: Confirmación humana requerida para asignación

### Success Criteria

1. **Expertise Match:** System suggests lawyers with matching specialty (e.g., daños personales → abogado especialista en daños)
2. **Complexity Fit:** Senior lawyers assigned to high-complexity cases (based on monto and tipo)
3. **Workload Balance:** System shows current caseload per lawyer to avoid overload
4. **Human Approval:** Assignment is displayed as "Sugerido" pending confirmation; actual assignment requires user action
5. **Assignment History:** All assignment decisions (auto or manual) are logged with timestamp

### Dependencies
- Phase 3 (needs triage data to inform complexity)

---

## Progress Table

| Phase | Goal | Status |
|-------|------|--------|
| 1 - Document Processing | Upload PDF → extracted data with confidence | Pending |
| 2 - Data Storage | Store, filter, search, export | Pending |
| 3 - Triage | Auto-classify priority + summaries | Pending |
| 4 - Assignment | AI-suggested lawyer assignment | Pending |

---

## v2 Backlog (Out of Scope)

- Generación automática de contestaciones
- Seguimiento de casos (consulta SAIJ)
- Analytics y reporting
- Integración con sistemas internos (ERP, gestión de siniestros)
- Generación de ficheo por caso

---

*Generated: 2026-02-26*
