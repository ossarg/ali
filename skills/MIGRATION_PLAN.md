# Plan: Migrar Skills de .py a SKILL.md (formato Claude Code)

## Problema

Los skills se implementaron como archivos Python con Pydantic schemas y clases ABC. El formato correcto para Claude Code es `SKILL.md` — archivos markdown con YAML frontmatter e instrucciones en prosa que Claude sigue al invocar el skill.

## Formato objetivo

Cada skill = un directorio con un `SKILL.md`:

```
skills/
├── SKILLS_SPEC.md                    # Se mantiene como referencia de mapeo
├── ingestion-document-summary-ar/
│   └── SKILL.md
├── ingestion-formal-review-ar/
│   └── SKILL.md
├── extraction-claim-summary-ar/
│   └── SKILL.md
├── extraction-policy-summary-ar/
│   └── SKILL.md
├── triage-risk-assessment-ar/
│   └── SKILL.md
├── triage-coverage-opinion-ar/
│   └── SKILL.md
├── triage-viability-check-ar/
│   └── SKILL.md
├── drafting-answer-ar/
│   ├── SKILL.md
│   └── templates/
│       ├── contestacion_base.md      # Se mantiene tal cual
│       ├── negativas_standard.md     # Se mantiene tal cual
│       └── excepciones_catalog.md    # Se mantiene tal cual
├── drafting-canned-responses-ar/
│   └── SKILL.md
├── drafting-legal-memo-ar/
│   └── SKILL.md
├── drafting-coverage-denial-ar/
│   └── SKILL.md
├── review-red-team-verifier/
│   └── SKILL.md
└── knowledge/                        # Se mantiene como está
    └── README.md
```

## Estructura de cada SKILL.md

```markdown
---
name: <skill-name>
description: <una línea>
---

# Nombre del Skill

<Descripción corta>

## Contexto
- Agente que lo consume
- Prioridad (P0/P1/P2/P3)
- Fase del roadmap

## Instrucciones
<El system prompt actual, reformateado como markdown>

## Output esperado
<La estructura Pydantic convertida a secciones markdown con tablas>
<Ejemplo de output en JSON o markdown estructurado>

## Normativa de referencia
<Knowledge refs como lista con artículos y colección RAG>

## Umbrales de confianza
- Confidence threshold: X (debajo → revisión humana)
- Escalation threshold: Y (debajo → halt)

## Reglas
<Las reglas del prompt actual>
```

## Qué se conserva del trabajo actual

| Elemento | Acción |
|----------|--------|
| System prompts (texto) | Migrar íntegro a sección "Instrucciones" |
| Output schemas (Pydantic) | Convertir a tablas markdown + ejemplo JSON |
| Knowledge refs | Convertir a sección "Normativa de referencia" |
| Confidence thresholds | Migrar a sección propia |
| Templates (3 .md en drafting/) | Mover a `drafting-answer-ar/templates/` sin cambios |
| SKILLS_SPEC.md | Mantener como referencia de mapeo agente→skill |
| knowledge/README.md | Mantener |
| base.py, __init__.py, *.py | Eliminar |

## Qué cambia

1. **Estructura de directorios**: de `skills/<agente>/<skill>.py` a `skills/<agente>-<skill>/SKILL.md`
2. **Schemas**: de Pydantic models a tablas markdown con ejemplo de output
3. **Config**: de `SkillConfig` Python a YAML frontmatter + secciones markdown
4. **Base class**: se elimina — no hay herencia, cada SKILL.md es autocontenido

## Orden de migración

Seguir la priorización existente:

1. **P0**: document-summary-ar, claim-summary-ar, risk-assessment-ar
2. **P1**: formal-review-ar, policy-summary-ar, coverage-opinion-ar, viability-check-ar
3. **P2**: answer-ar (CORE), canned-responses-ar, coverage-denial-ar, red-team-verifier
4. **P3**: legal-memo-ar

## Referencia de formato

Ejemplo completo de un SKILL.md bien hecho: `/Users/juanmazzochi/.claude/skills/diagram/SKILL.md`

Los skills legales existentes (`legal-risk-assessment`, `legal-canned-responses`, etc.) son stubs — no sirven como referencia de contenido pero sí confirman la convención de naming.
