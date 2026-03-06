# Knowledge Base — Libra Legal AI

Base de conocimiento normativo para el sistema RAG. Cada subdirectorio
contiene documentos indexados que los agentes consultan al ejecutar skills.

## Estructura

```
knowledge/
├── cpcycn/           # Código Procesal Civil y Comercial de la Nación
├── ley_seguros/      # Ley 17.418 de Seguros
├── ccc/              # Código Civil y Comercial de la Nación
└── jurisprudencia/   # Fallos relevantes de seguros
```

## Formato de documentos

Cada norma se indexa como chunks de texto con metadata:
- `source`: nombre de la norma
- `article`: número de artículo
- `section`: sección/título/capítulo
- `text`: texto completo del artículo

## Normas a incorporar

| Norma | Colección | Prioridad | Agentes que la usan |
|-------|-----------|-----------|---------------------|
| CPCyCN | `cpcycn` | P0 | Ingestion, Drafting |
| Ley 17.418 | `ley_seguros` | P0 | Extraction, Triage, Drafting |
| CCC (arts. 1708-1780, 2560-2564) | `ccc` | P1 | Drafting, Triage |
| Ley 24.240 Defensa del Consumidor | `ccc` | P2 | Triage, Drafting |
| Acordadas CSJN | `cpcycn` | P3 | Ingestion |
| Códigos procesales provinciales | `cpcycn` | P3 | Ingestion, Drafting |

## Ingesta de normativa

TODO: Implementar pipeline de ingesta:
1. Obtener texto oficial de cada norma (InfoLEG / SAIJ)
2. Chunking por artículo con overlap de sección
3. Generar embeddings
4. Indexar en vector DB
