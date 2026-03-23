# Reporte Completo — Libra Legal AI
**Fecha:** 23 de marzo 2026 | **Autor:** Ali (Coordinadora del Pipeline)

---

## 1. Estado del Proyecto

### Pipeline canónico
```
Rachel → Donna → Mike → Edu → Jess → Lou → Abogado
```

| Agente | Rol | Skills | Estado |
|--------|-----|--------|--------|
| Rachel | Intake / Email Router | intake-mail-classifier-ar | ✅ Operativo, cron pendiente de activar |
| Donna | Ingestion | ingestion-document-summary-ar + ingestion-formal-review-ar | ✅ Operativo |
| Mike | Extraction | extraction-claim-summary-ar + extraction-policy-summary-ar | ✅ Operativo (SISE pendiente) |
| Edu | Triage | triage-risk-assessment-ar + triage-coverage-opinion-ar + triage-viability-check-ar | ✅ Operativo |
| Jess | Drafting | drafting-answer-ar + drafting-docx-ar | ✅ Reescrita hoy |
| Lou | Review | review-consistency-ar + review-normative-risk-ar | ✅ Skills creados hoy |

### Infraestructura
- **Backend:** Go+Echo, Docker, postgres, redis — operativo en Pi 5
- **Frontend:** React+Vite, puerto 3000 — operativo
- **OpenClaw:** 2026.3.13, LCM activo, QMD 2.0.1, ByteRover
- **Repo:** github.com/ossarg/ali, branch `feature/add-lou-agent` (PR pendiente merge)

---

## 2. Batch Test — 7 Demandas Reales

### Ejecución: 18 de marzo 2026
- **Tiempo total:** 34 minutos (pool de 3 workers)
- **Modelo:** Claude Sonnet 4.6
- **Tokens estimados:** ~500K total

### Resultados por caso

| # | Caso | Tipo | Monto | Pipeline | Lou v1 | Lou v2 |
|---|------|------|-------|----------|--------|--------|
| 1 | Soria c/ Gómez | RC Auto | $5.3M | ✅ Completo | 79 | **78 — aprobar** |
| 2 | Kumazawa + Gavilán c/ Olmedo | RC Auto | $9M | ✅ Completo | 76 | **62 — corregir** |
| 3 | Aliaga Quispe + Espinoza c/ Andreu | RC Auto moto | $13.6M | ✅ Completo | 81 | **66 — corregir** |
| 4 | Asociart c/ Rojas | ART repetición | $39.8M | ✅ Completo | 82 | **48 — escalar** |
| 5 | Cabaña c/ Libra | Ejecución acuerdo | $534K | ⛔ STOP Donna | — | — |
| 6 | Biallías c/ Libra | Robo moto (OCR) | $5M | ✅ Completo (OCR) | n/d | n/d |
| 7 | Matthiess + Sardo | RC acuerdo (OCR) | $936K | ✅ Completo (OCR) | n/d | n/d |

**Nota:** Lou v2 es más exigente que v1 — detecta errores que v1 pasaba por alto. Los scores más bajos reflejan mayor rigurosidad, no peor calidad del borrador.

### Hallazgos por caso (Lou v2)

**Soria c/ Gómez (78 — APROBAR):**
- Borrador sólido, 2 correcciones menores (art. 346→347 inc. 6, agregar negativa general explícita)

**Kumazawa c/ Olmedo (62 — CORREGIR):**
- Fecha del siniestro ambigua (23 vs 24/10/2023)
- DNI del demandado inconsistente
- Normas procesales: referencian CPCyCN pero el fuero es PBA (CPCC PBA)

**Aliaga Quispe c/ Andreu (66 — CORREGIR):**
- Número de póliza como placeholder sin resolver
- Defensa de irregularidad de citación en garantía omitida

**Asociart c/ Rojas (48 — ESCALAR):**
- Error de plazo: borrador dice 30 días, son 15 días hábiles
- Póliza no identificada en caso de $39.8M
- Exclusión por uso comercial del taxi no investigada
- **Requiere abogado senior**

---

## 3. Evolución del DOCX

### Métricas de contenido

| Versión | Chars promedio | Negativas | Oponibilidad | Defensa juicio | Impugn. documental | Impugn. montos |
|---------|---------------|-----------|-------------|----------------|-------------------|----------------|
| v1 (18/03) | 8K | 6-9 | ❌ | ❌ | ❌ | ❌ |
| v2 (23/03 AM) | 34K | 22-26 | ✅ | ✅ | ✅ | ✅ |
| v3/v5 (23/03 PM) | 24K (DOCX) | 22-26 | ✅ | ✅ | ✅ | ✅ |
| Modelo real Libra | 25-47K | 20-50 | ✅ | ✅ | ✅ | ✅ |

**Completitud estimada:** 75% (era 40% en v1)

### Formato DOCX
- Arial 11pt, justificado
- Márgenes: top 5cm, bot 2cm, left 5cm, right 1.5cm
- Encabezados: BOLD + UNDERLINE
- Numeración romana (I. II. III...)
- Negativas: "1. Que [hecho]."
- Página final de notas para el abogado (separada del escrito)
- Editable en MS 365

---

## 4. Skills — Cambios del día

### Nuevos (creados hoy)
| Skill | Agente | Descripción |
|-------|--------|-------------|
| `review-consistency-ar` | Lou | Verificación factual + cross-agent + completitud |
| `review-normative-risk-ar` | Lou | Verificación jurídica + plazos + riesgo operativo + score |

### Reescritos (hoy)
| Skill | Cambio principal |
|-------|-----------------|
| `drafting-answer-ar` | +4 secciones obligatorias, mínimo 15 negativas, target 25-40K chars |
| `triage-coverage-opinion-ar` | Nuevo dictamen COBERTURA_PENDIENTE_VERIFICACION |
| `agents/ali/AGENTS.md` | Separación modo canal vs. modo trabajo |

### Fixes aplicados (5 gaps del audit)
| Gap | Fix |
|-----|-----|
| GAP-2 | Lou: 4 valores canónicos forzados en snake_case |
| GAP-4 | Jess: placeholders nunca inline, siempre en secciones_requieren_revision |
| GAP-5 | Mike: consolida monto_reclamado.total automáticamente |
| GAP-6 | Donna: overall_confidence siempre float (0.0-1.0) |
| GAP-7 | Donna: detecta PDF OCR, marca pdf_tipo, reduce confidence |

### Boilerplates creados
| Archivo | Contenido |
|---------|-----------|
| `boilerplate-oponibilidad.md` | 5 fallos CSJN + normativa completa |
| `boilerplate-defensa-juicio.md` | Cláusula 3 Póliza Básica verbatim |
| `boilerplate-flores-csjn.md` | Argumentación extendida Flores c/ Giménez |

---

## 5. Métricas por agente (promedio batch)

| Agente | Confidence | Tiempo | Observaciones |
|--------|-----------|--------|---------------|
| Donna | 0.90 | 2:39 | Más confiable. Clasificación precisa, STOP correcto en ejecución de acuerdo |
| Mike | 0.85 | 2:20 | Detección de inconsistencias (DNIs, montos). Gap: monto total null en 40% |
| Edu | 0.79 | 3:07 | Más lento. 100% INDETERMINADO en cobertura por falta de póliza |
| Jess | 0.72 | 2:53 | Confidence bajo esperado (incertidumbre alta sin póliza) |
| Lou v1 | 0.85 | 2:04 | Schema inconsistente. Score promedio 79.5 |
| Lou v2 | — | — | Más riguroso. Score promedio 63.5. Detecta errores que v1 pasaba |

---

## 6. Bloqueantes para producción

| # | Bloqueante | Owner | Estado | Impacto |
|---|-----------|-------|--------|---------|
| 1 | Letrado asignado por caso | Woz | ❌ Pendiente | DOCX siempre tiene [A COMPLETAR] |
| 2 | Fecha de notificación | Rachel + Woz | ❌ Pendiente | Plazo de contestación siempre placeholder |
| 3 | SISE lookup (póliza) | Woz | ❌ Pendiente | Edu siempre INDETERMINADO |

### No bloqueantes pero importantes
| # | Item | Owner | Estado |
|---|------|-------|--------|
| 4 | Dashboard con datos reales (no mock) | Woz | ❌ |
| 5 | Tab borrador DOCX en webapp | Woz | ❌ |
| 6 | Dictamen de cobertura visible en UI | Woz | ❌ |
| 7 | Endpoint correcciones abogado | Woz | ❌ |

---

## 7. Sistema de memoria

| Componente | Estado | Score |
|-----------|--------|-------|
| LCM (lossless-claw) | ✅ Activo | Historial completo, nada se pierde |
| QMD 2.0.1 | ✅ 193 archivos indexados | Búsqueda semántica operativa |
| ByteRover | ✅ Context tree curado | Pipeline, agentes, decisiones, caso García |
| Memory flush | ✅ 4000 tokens | Pre-compactación automática |
| Cron nocturno | ✅ 23:30 diario | Cierre automático de sesión |
| LEARNINGS.md | ✅ Actualizado | Reglas operativas siempre disponibles |
| Case logs | 🟡 1 caso curado | Crece con el batch real |

**Score memoria: 8/10**

---

## 8. Observabilidad

### Implementado
- `audit.jsonl` con timestamps por step (53 eventos en el batch)
- `batch-state.json` con checkpoints y `blocked_by`
- `output.json` por caso con confidence scores y resultado de Lou
- `BATCH_AUDIT_REPORT.md` generado automáticamente

### Pendiente (basado en research de LangSmith)
- Tabla `pipeline_traces` en DB (schema propuesto en `docs/observability-research.md`)
- Token tracking por agente
- Comparación A/B de versiones de skills
- Feedback loop del abogado

---

## 9. UX Research (abogados)

### 4 gaps críticos detectados
1. 🔴 El borrador DOCX no existe en la UI — tab "Borrador de Contestación" es placeholder vacío
2. 🔴 Plazo de contestación usa `updated_at` como proxy (peligroso procesalmente)
3. 🔴 Dictamen de cobertura no aparece en ningún lado de la webapp
4. 🔴 Dashboard con datos mock hardcodeados

Reporte completo en `docs/ux-research.md`

---

## 10. Hallazgos de alto valor del pipeline

Resultados concretos que justifican el sistema:

1. **3 DNIs inconsistentes en Olmedo González** — argumento para excepción de defecto legal
2. **Inconsistencia monto letras/numeral en Soria** — $2.7M vs $4.1M en reparación del rodado
3. **Error de plazo en caso ART** — borrador decía 30 días, son 15 hábiles (Lou v2 lo detectó)
4. **Clasificación correcta de ejecución de acuerdo** — Donna detuvo el pipeline estándar y derivó
5. **Riesgo de conducta procesal reprochable** en Matthiess/Sardo — Lou flaggeó antes del abogado

---

## 11. Plan de acción — próximos pasos

### Inmediato (esta semana)
1. Merge de `feature/add-lou-agent` a development
2. Corregir los hallazgos de Lou v2 en los 2 casos "corregir" y regenerar
3. Woz: letrado + fecha de notificación en el flujo

### Corto plazo (semana 2-3)
4. Woz: SISE lookup → Edu con póliza real
5. Woz: tab borrador DOCX en webapp + dictamen cobertura visible
6. Segundo batch con 15-20 demandas nuevas en modo supervisado

### Mediano plazo (mes 1)
7. Woz: endpoint correcciones abogado → feedback loop de Lou
8. Woz: pipeline_traces en DB (observabilidad real)
9. Primer caso real en producción con abogado usando el borrador
