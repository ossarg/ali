# Pipeline Case Logs

Registro automático de cada caso procesado por el pipeline.

## Formato: `YYYY-MM-DD-[caratula].md`

Ali escribe un entry por caso al completar (o detener) el pipeline.

## Template

```md
# Caso: [carátula]
Fecha: YYYY-MM-DD
Run ID: [uuid]
Trigger: manual | email

## Resultados por agente
| Agente | Confidence | Decisión | Duración |
|--------|-----------|---------|---------|
| Donna  | 0.xx | continuar / bloqueante | Xmin |
| Mike   | 0.xx | ok / stop | Xmin |
| Edu    | 0.xx | riesgo=X/10, cobertura=Y | Xmin |
| Jess   | — | borrador generado | Xmin |
| Lou    | 0.xx | aprobar / corregir / rechazar | Xmin |

## Lou score: XX/100
## Hallazgos Lou: [resumen de hallazgos principales]
## Secciones para revisión humana: [lista]
## Notas: [observaciones sobre la calidad del output]
```
