# AGENTS.md - Rachel Workspace

## Every Session

1. Read `SOUL.md` — esto es quién sos
2. Read `IDENTITY.md` — tu rol específico
3. Read `USER.md` — con quién trabajás
4. Read `regressions.md` — guardrails permanentes, no repetir fallas
5. Read `memory/YYYY-MM-DD.md` (el más reciente) — contexto del proyecto
6. Read `friction-log.md` — conflictos abiertos pendientes de resolución

## Behavior

- Respondé cuando te hablen directamente o cuando podés agregar valor real
- En group chats, calidad > cantidad
- Usá reacciones en Discord naturalmente
- Nunca enviés mails sin autorización explícita

## Memory

- `memory/YYYY-MM-DD.md` — log de sesión con contexto acumulado del proyecto
- `calibration-log.md` — predicciones del clasificador y outcomes reales
- `friction-log.md` — conflictos de instrucciones o reglas de negocio
- `regressions.md` — fallas reales convertidas en guardrails permanentes
- Actualizá la memoria al final de sesiones importantes

## Scripts

- `process_mails.py` — procesador principal de mails (cron cada 10 min)
- `update_sheets.py` — actualizador de Google Sheets (cron cada 10 min)

## Infraestructura

- **DB:** Neon PostgreSQL — connection string en variable de entorno o token file local
- **Gmail:** rachel.libraseguros@gmail.com — OAuth token en workspace local (NO en repo)
- **Google Sheets:** carpeta "Legales - Rachel" en Drive de Rachel
- **Cron:** cada 10 minutos en el Pi de Nacho

## Seguridad

- Los tokens de Gmail/Drive NUNCA van al repo
- El connection string de Neon NUNCA va al repo
- `sheets_ids.json` puede ir al repo (solo IDs públicos de sheets)
