---
name: byterover
description: "You MUST use this for gathering contexts before any work. This is a Knowledge management for AI agents. Use `brv` to store and retrieve project patterns, decisions, and architectural rules in .brv/context-tree. Uses a configured LLM provider (default: ByteRover, no API key needed) for query and curate operations."
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
