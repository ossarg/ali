# Parámetros Provisorios — Triage de Cobertura y Reservas

> **Estado:** PROVISORIO — pendiente de calibración con experiencia real de Libra
> **Creado:** 2026-03-07
> **Responsable de revisión:** Juan Mazzochi
> **Próxima revisión:** a definir según acumulación de casos reales

---

## Propósito

Este documento centraliza todas las **asunciones y presunciones** usadas en `triage-coverage-opinion-ar/SKILL.md` para el cálculo de exposición económica y la generación de escenarios de reserva.

Los valores actuales son estimaciones iniciales. **Deben ser ajustados en función de la experiencia real de Libra** a medida que se procesen casos y se obtengan datos de condenas, duraciones de proceso y costas reales.

---

## Parámetros activos

### 1. Horizonte temporal (duración estimada del proceso)

| Tipo de proceso | Jurisdicción | Valor actual | Fuente | Confianza |
|---|---|---|---|---|
| Ordinario | PBA | **A definir con Libra** | Sin datos reales aún | ⚠️ Sin calibrar |
| Ordinario | CABA | **A definir con Libra** | Sin datos reales aún | ⚠️ Sin calibrar |
| Sumarísimo | PBA | **A definir con Libra** | Sin datos reales aún | ⚠️ Sin calibrar |

> **Nota:** El skill usaba como referencia genérica "4-6 años desde demanda para ordinario en PBA". Este valor fue removido por ser estimación sin base en la experiencia de Libra. Reemplazar con datos reales en cuanto estén disponibles.

**Acción pendiente:** Levantar con el equipo de Libra (abogados con mayor antigüedad en la cartera) la duración típica de los juicios ordinarios de RC Auto en los departamentos judiciales donde opera Libra.

---

### 2. Tasa de interés de referencia para el cálculo de exposición

| Jurisdicción | Tasa aplicada por los tribunales | Valor actual | Confianza |
|---|---|---|---|
| CABA | Tasa activa BNA (acumulativa) | Referencia estándar — a confirmar con abogados | Media |
| PBA | Variable por departamento judicial | **A definir por departamento** | ⚠️ Sin calibrar |

> **Nota:** La tasa de interés es el mayor driver de exposición en juicios largos. En algunos departamentos de PBA se aplica tasa activa, en otros tasa pasiva + algo. Esto puede cambiar significativamente la exposición real. Necesitamos datos por departamento.

**Acción pendiente:** Mapear tasa de interés predominante en los 3-5 departamentos judiciales donde Libra tiene mayor volumen de causas.

---

### 3. Costas (estimación de honorarios del actor + peritos)

| Escenario | Porcentaje sobre capital de condena | Fuente | Confianza |
|---|---|---|---|
| Referencia general | 25-40% | Estimación inicial sin casos reales | ⚠️ Sin calibrar |
| Caso típico asumido | 35% | Default del skill hasta calibración | ⚠️ Sin calibrar |

> **Nota:** Las costas varían según: tipo de proceso, complejidad, número de peritos, arancel aplicable en la jurisdicción, y eventual regulación de honorarios. El 35% es un proxy inicial que necesita ser calibrado con datos reales de Libra.

**Acción pendiente:** Levantar con el área de administración de Libra las costas promedio efectivamente pagadas en los últimos 12-24 meses, segmentado por jurisdicción y tipo de caso.

---

### 4. Factor de probabilidad de condena por tipo de caso

| Tipo de caso | Probabilidad base asumida | Confianza |
|---|---|---|
| RC Auto con fallecimiento — sin exclusiones claras | Alta | ⚠️ Sin calibrar |
| RC Auto con lesiones — sin exclusiones claras | Media-Alta | ⚠️ Sin calibrar |
| RC Auto con daños materiales solamente | Media | ⚠️ Sin calibrar |
| Caso con pericia mecánica penal estableciendo responsabilidad | Muy Alta | ⚠️ Sin calibrar |

> **Nota:** Estos factores alimentan los escenarios "probable" y "peor caso". Sin datos reales, el skill usa criterio jurídico general. Calibrar con el historial de condenas de Libra.

**Acción pendiente:** Con suficiente volumen de casos procesados, generar estadística interna de condenas por tipo de caso.

---

### 5. Reducción típica de montos reclamados en condena

| Rubro | Reducción estimada respecto al monto reclamado | Confianza |
|---|---|---|
| Daño moral | 30-60% de reducción sobre lo pedido | ⚠️ Sin calibrar |
| Incapacidad sobreviniente | 10-40% de reducción | ⚠️ Sin calibrar |
| Daño estético | 20-50% de reducción | ⚠️ Sin calibrar |
| Gastos médicos y de traslado | Reducción baja (documentables) | ⚠️ Sin calibrar |
| Valor vida / fallecimiento | Variable alta | ⚠️ Sin calibrar |

> **Nota:** La reducción de rubros es clave para el escenario "probable". Sin datos reales de condenas en la cartera de Libra, se usa criterio general de la jurisprudencia mayoritaria.

---

## Log de cambios

| Fecha | Cambio | Responsable |
|---|---|---|
| 2026-03-07 | Creación del documento. Parámetros iniciales identificados como provisorios. | Ali (post-auditoría v1) |

---

## Cómo actualizar este documento

1. Cuando se procesen los primeros 20-30 casos con el sistema operativo, relevar:
   - Duración real de los procesos (fecha demanda → fecha sentencia)
   - Costas efectivamente pagadas
   - Tasa de interés aplicada en cada jurisdicción
   - Diferencia entre monto reclamado y condena por rubro

2. Actualizar los valores de la tabla con los datos reales.

3. Registrar el cambio en el Log de cambios con fecha y fuente.

4. Notificar a Ali para que actualice el SKILL.md de triage-coverage-opinion-ar con los nuevos parámetros.

---

> **Recuerda:** Cualquier output de triage generado con estos parámetros sin calibrar debe ser revisado por el abogado antes de usarse para decisiones de reserva con impacto real. Los escenarios son orientativos, no definitivos.
