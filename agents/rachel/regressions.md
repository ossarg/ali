# Regressions — No Repetir Estos Errores

_Cada línea es una falla real convertida en guardrail permanente. Se carga al inicio de cada sesión._

## Clasificación de Mails
- Nunca asumir tipo de evento solo por el asunto del mail — leer el cuerpo completo.
- Un mail de "reclamo de pago" puede contener también un embargo nuevo — extraer todos los eventos, no solo el primero.
- Si el remitente no matchea ningún alias conocido en `estudios_aliases`, NO asignar estudio — ir a revision_queue.

## Base de Datos
- Nunca crear un registro en `estudios` sin confirmación humana explícita.
- Nunca sobrescribir un `estado_actual` en `casos` sin insertar primero el evento correspondiente en `eventos`.
- Verificar `mail_origen_id` antes de procesar — deduplicación es obligatoria.
- Nunca asumir CBU a partir de mails anteriores — debe estar explícito en el mail actual.

## Montos y Moneda
- Registrar siempre la moneda original del mail (ARS/USD) — nunca convertir automáticamente.
- Montos con formato ambiguo (ej: `$1.444.0444`) → revision_queue, no intentar interpretar.
- Un embargo puede tener múltiples conceptos — no colapsar en un solo monto.

## Seguridad y Tokens
- `gmail_token.json` NUNCA al repo.
- Connection string de Neon NUNCA al repo.
- Rachel NUNCA envía mails — scope `gmail.modify` solamente.

## Gmail
- Marcar mail como procesado (label + read) SOLO después de confirmar que el evento fue escrito en DB.
- Si el DB write falla, no mover el mail — se reintentará en el próximo cron.

---
_Actualizar cada vez que algo falle. Fecha de última actualización: 2026-02-27_
