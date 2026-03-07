# Plan de Implementación — Ajustes Post-Auditoría Pipeline v1

**Fuente:** Auditoría de Juan Mazzochi (2026-03-06) sobre el pipeline Segovia c/ Ortiz Galeano
**Ejecutor:** Ali
**Branch objetivo:** `feature/audit-v1-improvements`
**Fecha de inicio:** 2026-03-06

---

## Instrucciones de recuperación de contexto

Si el contexto se compacta o supera el 60%, antes de continuar:
1. Leer este archivo: `docs/implementation-plan-audit-v1.md`
2. Verificar qué ítems tienen `[x]` (completado) vs `[ ]` (pendiente)
3. Leer el último archivo modificado para tener el estado exacto
4. Continuar desde el primer ítem sin `[x]`

---

## Estado de la branch

```bash
cd /home/legales/.openclaw/workspace/ali
git checkout -b feature/audit-v1-improvements
```

**Status:** [x] Branch creada

---

## Grupo 0 — Orquestación y skills nuevos

### 0.1 ORCHESTRATION.md — Regla fecha_notificacion en modo manual
**Archivo:** `agents/ali/ORCHESTRATION.md`
**Cambio:** Agregar regla explícita: si `origen = manual` y `fecha_notificacion_asegurador = null`, Ali solicita el dato al operador antes de pasar a Mike. Si el operador no lo conoce, continuar con null y marcar como pendiente crítico en la entrega al abogado.

**Status:** [x] Implementado

### 0.2 Skill stub — `extraction-policy-lookup-ar`
**Archivo:** `skills/extraction-policy-lookup-ar/SKILL.md` (nuevo)
**Cambio:** Crear skill stub que describe la integración con sistemas internos de Libra para obtener la póliza a partir de datos del asegurado/vehículo. El mapping técnico queda como TODO pendiente de definición con Juan.

**Status:** [x] Implementado

### 0.3 Docs — Policy lookup integration spec
**Archivo:** `docs/policy-lookup-integration.md` (nuevo)
**Cambio:** Documento para definir con Juan cómo conectar con el sistema interno: formato de respuesta, autenticación, campos de búsqueda (número de póliza / dominio del vehículo / datos del asegurado).

**Status:** [x] Implementado

---

## Grupo 1 — `ingestion-document-summary-ar` (ALTA)

### 1.1 Agregar extracción de datos económicos de la víctima en casos de fallecimiento
**Archivo:** `skills/ingestion-document-summary-ar/SKILL.md`
**Cambio:** Agregar en las instrucciones del skill: cuando `señales_atencion` incluya `fallecimiento`, extraer también `victima.datos_economicos`:
- Edad de la víctima
- Ingresos mensuales y fuentes (jubilación, trabajo, etc.)
- Vida útil estimada según la demanda
- Distribución porcentual del valor vida si la demanda la especifica

Agregar al output schema el campo `victima` (solo en casos con fallecimiento).

**Status:** [ ] Implementado

---

## Grupo 2 — `extraction-claim-summary-ar` (ALTA + MEDIA)

### 2.1 Campo `victima.datos_economicos` al schema (ALTA)
**Archivo:** `skills/extraction-claim-summary-ar/SKILL.md`
**Cambio:** Agregar sección "Datos económicos de la víctima" (solo si hay fallecimiento):
- `victima.edad`
- `victima.ingresos_mensuales` (monto y fuentes)
- `victima.vida_util_estimada` (según la demanda)

**Status:** [ ] Implementado

### 2.2 Campo `rubros.distribucion_porcentual` (MEDIA)
**Archivo:** `skills/extraction-claim-summary-ar/SKILL.md`
**Cambio:** Para el rubro valor vida, si la demanda especifica distribución porcentual entre actores, extraerla como campo adicional.

**Status:** [ ] Implementado

### 2.3 Campo `rubros.base_calculo` (MEDIA)
**Archivo:** `skills/extraction-claim-summary-ar/SKILL.md`
**Cambio:** Para cada rubro, si la demanda describe la metodología de cálculo (ej: "2 sesiones semanales × 3 años × $8.000/sesión"), extraerla como `base_calculo`.

**Status:** [ ] Implementado

### 2.4 Campos `solicitud_astreintes` y `solicitud_tasa_interes` (MEDIA)
**Archivo:** `skills/extraction-claim-summary-ar/SKILL.md`
**Cambio:** Agregar al schema de `reclamo`:
- `solicitud_astreintes`: boolean + monto/porcentaje si se especifica
- `solicitud_tasa_interes`: tipo de tasa, desde cuándo, referencia (ej: "tasa activa Bco. Provincia desde la fecha del hecho")

**Status:** [ ] Implementado

---

## Grupo 3 — `triage-coverage-opinion-ar` (ALTA)

### 3.1 Documentar metodología de cálculo de escenarios
**Archivo:** `skills/triage-coverage-opinion-ar/SKILL.md`
**Cambio:** Agregar en las instrucciones: para cada escenario (mejor caso, probable, peor caso), documentar:
- Tasa de interés usada y fuente
- Horizonte temporal estimado (fecha probable de sentencia)
- Base de capital sobre la que se calculan intereses
- Si se incluyen costas y qué porcentaje se asume

**Status:** [ ] Implementado

### 3.2 Calibrar reserva sugerida incluyendo intereses acumulados
**Archivo:** `skills/triage-coverage-opinion-ar/SKILL.md`
**Cambio:** Agregar instrucción: la reserva sugerida debe incluir el capital + intereses acumulados hasta la fecha + estimación de intereses hasta sentencia + costas. No usar solo el capital de la demanda como base.

**Status:** [ ] Implementado

---

## Grupo 4 — `triage-viability-check-ar` (ALTA + BAJA)

### 4.1 Agregar defensa "culpa/hecho de la víctima" (ALTA)
**Archivo:** `skills/triage-viability-check-ar/SKILL.md`
**Cambio:** Agregar a la tabla de defensas estándar:
- **Culpa o hecho de la víctima (art. 1729 CCC)**: siempre evaluar en RC Auto. Factores: uso de casco, condición de las luces del vehículo de la víctima, velocidad, maniobras previas al impacto. Semáforo inicial: AMARILLO si hay elementos que sugieren posible conducta de la víctima.
- **Concurrencia de responsabilidad (art. 1773 CCC)**: relacionado con el anterior.

**Status:** [ ] Implementado

### 4.2 Agregar nota sobre suspensión prescriptiva por mediación (BAJA)
**Archivo:** `skills/triage-viability-check-ar/SKILL.md`
**Cambio:** En el check de prescripción, agregar: "Si hay acta de mediación previa, el plazo estuvo suspendido durante su trámite (art. 18 Ley 26.589). Registrar fechas de inicio y cierre de mediación si constan."

**Status:** [ ] Implementado

---

## Grupo 5 — `ingestion-formal-review-ar` (MEDIA)

### 5.1 Agregar check de citación en garantía art. 118 LS
**Archivo:** `skills/ingestion-formal-review-ar/SKILL.md`
**Cambio:** Agregar check #9: "Requisitos de citación en garantía (art. 118 Ley 17.418)" — solo aplica cuando hay aseguradora citada. Verificar: ¿se invocó expresamente el art. 118? ¿Se identifica el contrato de seguro (aunque sea sin número de póliza)? ¿La citación fue tramitada por quien tenía legitimación para hacerlo (el demandado, no el actor)?

**Status:** [ ] Implementado

---

## Grupo 6 — Jess PROMPT.md (ALTA + MEDIA)

### 6.1 No reconocer contrato sin verificar póliza (ALTA)
**Archivo:** `agents/borrador/PROMPT.md`
**Cambio:** En la sección de reglas, agregar: "Nunca redactes la sección del contrato de seguro con reconocimiento expreso de su existencia. Usar siempre lenguaje condicional: 'para el hipotético caso de que se acredite la existencia y vigencia del contrato de seguro invocado en la demanda...' hasta que el abogado confirme la póliza."

**Status:** [ ] Implementado

### 6.2 Calibrar negativas contra pericia mecánica penal preexistente (ALTA)
**Archivo:** `agents/borrador/PROMPT.md`
**Cambio:** Agregar instrucción: cuando `extraction-claim-summary-ar` o `ingestion-document-summary-ar` indiquen la existencia de pericia mecánica penal preexistente, las negativas sobre mecánica del siniestro NO deben negar frontalmente los hechos que esa pericia establece. En su lugar: negar la exclusividad causal ("Niego que el siniestro haya sido causado exclusiva y excluyentemente por la conducta del asegurado"), no negar los hechos que la pericia ya probó.

**Status:** [ ] Implementado

### 6.3 Incluir defensa de culpa concurrente de la víctima (ALTA)
**Archivo:** `agents/borrador/PROMPT.md`
**Cambio:** Agregar sección de negativas estándar: en RC Auto con fallecimiento, siempre incluir en las negativas específicas y en la sección de defensas un placeholder para "culpa concurrente de la víctima (art. 1729 CCC)" con los puntos a investigar: casco, luces, velocidad, maniobras de la víctima.

**Status:** [ ] Implementado

### 6.4 Incluir impugnación de astreintes y tasa de interés (MEDIA)
**Archivo:** `agents/borrador/PROMPT.md`
**Cambio:** Si `extraction-claim-summary-ar` extrae `solicitud_astreintes = true` o `solicitud_tasa_interes`, generar en las negativas específicas la impugnación de esas solicitudes.

**Status:** [ ] Implementado

---

## Grupo 7 — Validación cruzada (pipeline)

### 7.1 Nota en ORCHESTRATION.md: validación de conteo documental
**Archivo:** `agents/ali/ORCHESTRATION.md`
**Cambio:** Agregar nota: Ali valida que el conteo de documentos reportado por Donna (`formal_review.checks[acompañamiento_documental].count`) coincida con el listado de Mike (`claim_summary.prueba_ofrecida.documental.count`). Si difieren, marcar inconsistencia y registrar en metadata del caso.

**Status:** [ ] Implementado

---

## Orden de ejecución

1. [ ] Crear branch `feature/audit-v1-improvements`
2. [ ] Grupo 0 (ORCHESTRATION.md + stubs nuevos)
3. [ ] Grupo 1 (ingestion-document-summary-ar)
4. [ ] Grupo 2 (extraction-claim-summary-ar)
5. [ ] Grupo 3 (triage-coverage-opinion-ar)
6. [ ] Grupo 4 (triage-viability-check-ar)
7. [ ] Grupo 5 (ingestion-formal-review-ar)
8. [ ] Grupo 6 (Jess PROMPT.md)
9. [ ] Grupo 7 (ORCHESTRATION.md validación cruzada)
10. [ ] Commit final + push + PR

---

## Criterio de calidad

- Cada cambio en un SKILL.md debe ser consistente con el output que ese skill produce (no agregar campos al schema sin agregar las instrucciones correspondientes)
- Los cambios en Jess PROMPT.md deben ser consistentes con el schema de input que Jess recibe (Mike + Edu outputs)
- Después de cada grupo: verificar que el archivo editado se guardó correctamente con `cat` parcial
