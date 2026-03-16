---
name: byterover
description: >
  Gestión de memoria persistente del proyecto con ByteRover CLI (`brv`). Usá este skill
  en dos momentos clave: (1) ANTES de empezar cualquier tarea que requiera contexto del
  proyecto — reglas vigentes, decisiones de diseño, arquitectura del pipeline, preferencias
  de Juan — ejecutando `brv query`; y (2) DESPUÉS de tomar una decisión importante o
  implementar algo nuevo, ejecutando `brv curate` para que no se pierda. Se activa cuando
  alguien dice "recordá esto", "quiero que sepas", "guardá esta regla", "¿cuál era la
  decisión sobre...?", "revisá el contexto antes de", o cuando Ali detecta que está a punto
  de trabajar sin saber si hay reglas previas sobre ese tema. No usar para información
  general o transitoria — solo para conocimiento persistente del proyecto Libra.
---

# ByteRover Knowledge Management

Use the `brv` CLI to manage your project's long-term memory.
Install: `npm install -g byterover-cli`
Knowledge is stored in `.brv/context-tree/` as human-readable Markdown files.

**No authentication needed.** `brv query` and `brv curate` work out of the box. Login is only required for cloud sync (`push`/`pull`/`space`) — ignore those if you don't need cloud features.

## Workflow
1. **Before Thinking:** Run `brv query` to understand existing patterns.
2. **After Implementing:** Run `brv curate` to save new patterns/decisions.

## Commands

### 1. Query Knowledge

```bash
brv query "How is authentication implemented?"
```

**Use when:**
- Necesitás recordar algo del proyecto
- Tu contexto no tiene la información que necesitás
- Antes de cualquier acción, para verificar reglas, criterios o preferencias vigentes

**No usar cuando:**
- La información ya está en el contexto actual
- Es conocimiento general, no memoria del proyecto

### 2. Curate Context

```bash
brv curate "Auth uses JWT with 24h expiry."
```

**Con archivos fuente** (máximo 5, paths relativos al proyecto):

```bash
brv curate "Pipeline canon" -f docs/pipeline-canon.md
```

**Ver historial:**
```bash
brv curate view
brv curate view cur-1739700001000   # detalle de una entrada
brv curate view detail              # con operaciones de archivos
brv curate view --since 1h --status completed
```

**Usar cuando:**
- El usuario quiere que recuerdes algo
- Hay decisiones de diseño, arquitectura o reglas nuevas
- Después de implementar algo importante

**No usar cuando:**
- La información ya está guardada y sin cambios
- Es información transitoria o solo relevante para la tarea actual

### 3. LLM Provider Setup

```bash
brv providers connect byterover   # default, sin API key
brv providers list                 # ver otras opciones
brv status                         # diagnóstico
```

## Error Handling

**Errores que requieren acción del usuario:**
- "Not authenticated" → `brv login --help`
- "No provider connected" → `brv providers connect byterover`

**Errores que Ali puede resolver:**
- "Missing required argument(s)." → `brv <command> --help`
- "Maximum 5 files allowed" → reducir a 5 o menos `-f` flags
- "File does not exist" → verificar path con `ls`, usar paths relativos
