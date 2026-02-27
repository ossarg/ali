# Long-Term Memory - Rachel

_Decisiones de diseño, contexto del proyecto, reglas aprendidas._

---

## Arquitectura

- **Event sourcing:** cada mail genera un evento inmutable en la tabla `eventos`. El estado actual se deriva de los eventos, no se sobreescribe.
- **DB:** Neon PostgreSQL. 15 tablas + 1 vista materializada (`performance_estudios`).
- **Storage:** adjuntos van a S3 (pendiente). Por ahora solo se analizan, no se persisten.
- **Google Sheets:** agrego filas, nunca sobreescribo. El gerente ve historial completo.

## Grupos de casos

- **Juicios:** asegurado demanda a Libra (incumplimiento de póliza)
- **Terceros:** tercero demanda al asegurado, Libra citada en garantía
- **Mediaciones:** instancia prejudicial

## Flujo de estadios

`apertura → sentencia → acuerdo → minuta_pago → reclamo_pago / embargo`

## Identificación de casos

- Principal: `nro_siniestro`
- Secundarios: `nro_expediente`, `caratula`
- Siempre verificar duplicados por `mail_origen_id` antes de insertar

## Estudios jurídicos

- Normalización via tabla `estudios_aliases` (email, dominio, variantes de nombre)
- Si no se reconoce el estudio → flag `estudio_nuevo` en `revision_queue` antes de crear
- Estudios conocidos: Patricia Vítolo, Jurídico MD, Iudicone Law Group, Mastroizzi-Tesone, Estudio Iriondo

## Reglas de negocio aprendidas

- Sentencia 1ra instancia = 1 firma en doc. Cámara = 3 firmas.
- Cuando hay embargo activo y se hace acuerdo → siempre incluir cláusula de desistimiento del embargo (no necesita autorización explícita)
- Monto en USD → registrar con campo `moneda = 'USD'`, flag para verificar conversión
- Propuestas de pago rechazadas → registrar en payload del evento con `cuotas_ofrecidas` y `cuotas_aceptadas: false`
- Honorarios tienen estados propios independientes del caso: regulado, apelado, intimado, pagado, ambiguo

## Alertas vs Revisión humana

- **`alertas`** → hechos claros que requieren acción (pago urgente, embargo activo, intimación)
- **`revision_queue`** → ambigüedad, datos inconsistentes, estudio no identificado, monto con posible typo

## Decisiones pendientes

- [ ] Conectar S3 para almacenar adjuntos PDF/Word/Excel
- [ ] Migrar a casilla Microsoft cuando esté disponible
- [ ] Configurar Mission Control (webapp) para que humanos resuelvan revisiones
- [ ] Calendario de vencimientos con alertas proactivas
- [ ] RAMO y RAJ: levantar del sistema de Libra (API pendiente)
