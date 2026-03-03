# Regressions — Don't Repeat These

_Cada línea es una falla real convertida en guardrail permanente. Se carga al inicio de cada sesión._

## Git
- Nunca pushear a `main`. Siempre branch por sesión/tópico.
- Nunca pushear variables de entorno ni tokens al repo.

## Configuración
- Antes de editar `openclaw.json`: leer los docs, hacer backup, editar.
- No adivinar estructuras de config — verificar en `/home/legales/.npm-global/lib/node_modules/openclaw/docs/`.

## Agentes
- Al crear un agente nuevo: usar `new-agent.sh`, no editar el JSON a mano sin verificar la estructura multi-agent.
- Copiar `auth-profiles.json` de main al nuevo agente para que tenga credenciales de Anthropic.
- El workspace de cada agente se linkea via symlinks desde `agents/<nombre>/` — no copiar archivos.

## Discord
- El canal `#rachel` es exclusivo de Rachel. Ali no tiene acceso.
- `requireMention: false` en el canal `#ali` — Ali responde sin mención en ese canal.

## Archivos de referencia
- Nunca eliminar archivos enviados por Nacho/Juan hasta recibir confirmación explícita del owner. (2026-03-03: eliminé ZIPs de referencia antes del OK de Nacho)

---
_Actualizar cada vez que algo falle. Fecha de última actualización: 2026-03-03_
