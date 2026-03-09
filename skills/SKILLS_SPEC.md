# Skills Spec — Libra Legal AI

Especificación de skills adaptados a derecho argentino y su mapeo a agentes.

## Mapeo Skill → Agente

```
Coordinator Agent
├── Ingestion Agent ─────── document_summary_ar (P0)
│                           formal_review_ar (P1, AR-específico)
│
├── Extraction Agent ────── claim_summary_ar (P0)
│                           policy_summary_ar (P1)
│
├── Triage Agent ────────── risk_assessment_ar (P0)
│                           coverage_opinion_ar (P1)
│                           viability_check_ar (P1)
│
├── Lou — Review ─ (usa outputs de todos los agentes upstream)
│
├── Drafting Agent (v2) ─── answer_ar (P2, CORE)
│                           canned_responses_ar (P2)
│                           legal_memo_ar (P3)
│                           coverage_denial_ar (P2)
│
├── Assignment Agent ────── (sin skill externo, lógica propia)
│
├── Review Agent ────────── red_team_verifier (P2)
│
└── [v2 agents]
    ├── Tracking Agent ──── (integración SAIJ)
    ├── Settlement Agent ── settlement_agreement_ar (P3, futuro)
    └── Analytics Agent ─── (lógica propia)
```

## Estructura de archivos

```
skills/
├── SKILLS_SPEC.md              ← este archivo
├── __init__.py
├── base.py                     # BaseSkill, SkillConfig, modelos compartidos
├── ingestion/
│   ├── __init__.py
│   ├── document_summary_ar.py  # Resumen de demanda judicial
│   └── formal_review_ar.py     # Revisión formal (nuevo, AR-específico)
├── extraction/
│   ├── __init__.py
│   ├── claim_summary_ar.py     # Resumen de siniestro
│   └── policy_summary_ar.py    # Resumen de póliza
├── triage/
│   ├── __init__.py
│   ├── risk_assessment_ar.py   # Evaluación de riesgo procesal
│   ├── coverage_opinion_ar.py  # Dictamen de cobertura
│   └── viability_check_ar.py   # Evaluación de viabilidad
├── drafting/
│   ├── __init__.py
│   ├── answer_ar.py            # Contestación de demanda ← CORE
│   ├── canned_responses_ar.py  # Respuestas estandarizadas
│   ├── legal_memo_ar.py        # Memorándum jurídico
│   ├── coverage_denial_ar.py   # Rechazo de cobertura
│   └── templates/
│       ├── contestacion_base.md    # Template estático de contestación
│       ├── negativas_standard.md   # Biblioteca de negativas
│       └── excepciones_catalog.md  # Catálogo de excepciones
├── review/
│   ├── __init__.py
│   └── red_team_verifier.py    # Verificador adversarial
└── knowledge/
    ├── README.md               # Instrucciones de ingesta de normativa
    ├── cpcycn/                 # Código Procesal (vacío, pendiente ingesta)
    ├── ley_seguros/            # Ley 17.418 (vacío, pendiente ingesta)
    ├── ccc/                    # Código Civil y Comercial (vacío, pendiente ingesta)
    └── jurisprudencia/         # Fallos relevantes (vacío, pendiente ingesta)
```

## Arquitectura de cada skill

Cada `.py` contiene:

1. **SkillConfig** — metadata: nombre, agente, prioridad, knowledge_refs, umbrales
2. **System prompt** — instrucciones completas en español AR para el LLM
3. **Output schema** — Pydantic models que validan el output estructurado
4. **Confidence thresholds** — cuándo escalar a revisión humana

Clase base en `base.py`:
- `BaseSkill` (ABC) con `get_system_prompt()`, `get_output_schema()`, `should_escalate()`
- `FieldWithConfidence` — campo extraído con confidence level y source_text
- `KnowledgeReference` — referencia a colección de vector DB para RAG
- Enums: `ConfidenceLevel`, `PriorityLevel`, `ViabilitySignal`, `FormalCheckStatus`

## Priorización

| Prioridad | Skills | Fase roadmap |
|-----------|--------|-------------|
| P0 (PoC) | document_summary_ar, claim_summary_ar, risk_assessment_ar | Phase 1 + 3 |
| P1 (MVP) | policy_summary_ar, coverage_opinion_ar, formal_review_ar, viability_check_ar | Phase 1-3 |
| P2 (MVP+) | answer_ar, canned_responses_ar, coverage_denial_ar, red_team_verifier | v2 (drafting) |
| P3 (Prod) | legal_memo_ar, settlement_agreement_ar (futuro) | v2 (completo) |

## Normativa argentina incorporada

| Norma | Colección RAG | Skills que la usan |
|-------|---------------|--------------------|
| CPCyCN | `cpcycn` | document_summary, formal_review, claim_summary, risk_assessment, answer_ar |
| Ley 17.418 | `ley_seguros` | claim_summary, policy_summary, coverage_opinion, viability_check, answer_ar, canned_responses, coverage_denial |
| CCC | `ccc` | coverage_opinion, viability_check, answer_ar, legal_memo |
| Ley 24.240 | `ccc` | coverage_opinion (riesgo pro-consumidor) |
| Jurisprudencia | `jurisprudencia` | legal_memo, red_team_verifier |

## Adaptaciones clave US → AR

| Concepto US | Adaptación AR | Skill afectado |
|-------------|---------------|----------------|
| Complaint structure | Hechos, derecho, prueba, petitorio (arts. 330-331) | document_summary_ar |
| Admissions/Denials (FRCP 8b) | Negativa general + específicas (art. 356 inc. 1) | answer_ar |
| Affirmative Defenses (FRCP 8c) | Excepciones previas (arts. 346-354) + defensas de fondo | answer_ar |
| Duty to defend/indemnify | Obligaciones asegurador (arts. 109-120 Ley 17.418) | coverage_opinion_ar |
| Policy number / claim ID | Nº póliza, nº siniestro, nº expediente, carátula, fuero | claim_summary_ar |
| Severity-by-likelihood (USD) | Umbrales ARS/UVA, plazos AR, jurisdicción diferencial | risk_assessment_ar |
| Conflict check | Viabilidad: vigencia, denuncia, caducidad, exclusión | viability_check_ar |
| Tender letter denial | Rechazo de cobertura bajo Ley 17.418 | coverage_denial_ar |

## Pendientes

- [ ] Ingestar normativa en knowledge base (vector DB)
- [ ] Validar template de contestación con templates reales de Libra
- [ ] Testear extracción con demandas reales anonimizadas
- [ ] Review por abogado argentino de los prompts del Drafting Agent
- [ ] Test E2E: PDF de demanda → resumen + triage + borrador
- [ ] Implementar skills faltantes: settlement_agreement_ar (P3)
