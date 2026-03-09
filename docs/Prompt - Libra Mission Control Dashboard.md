---
tags:
  - project
  - plan
type: prompt
status: active
started: "2026-02-24"
project: "[[Libra]]"
---

# Prompt — Libra Legal AI: Mission Control Dashboard

## Para usar en Stitch / Google AI Studio

Copiá todo lo que está debajo de la línea y pegalo como prompt.

---

## PROMPT

Construí una aplicación web standalone tipo "Mission Control" para un sistema de agentes de IA que gestiona litigios judiciales de una compañía de seguros argentina. La app es un dashboard profesional, intuitivo y completamente en español. Debe funcionar con datos mock precargados para que se pueda navegar y testear toda la experiencia.

### Contexto del producto

Libra Seguros es una aseguradora argentina que está internalizando su gestión de litigios. El sistema usa agentes de IA (Claude / OpenAI) como co-workers legales: reciben demandas judiciales en PDF, extraen datos, clasifican por prioridad, arman ficheros digitales, generan borradores de contestación y sugieren asignación a abogados. Ninguna acción con consecuencias legales se ejecuta sin validación humana — el sistema sugiere, el abogado decide.

### Arquitectura de agentes

El sistema tiene un agente coordinador que orquesta 5 sub-agentes especializados:

1. **Agente de Ingesta y Revisión** — Recibe el PDF de la demanda, extrae texto, verifica formalidades procesales (firma, partes, competencia del tribunal, plazos). Señala irregularidades.
2. **Agente de Extracción de Datos** — Del texto extraído, produce un objeto estructurado: demandante, demandado, jurisdicción, tribunal, monto reclamado, moneda, fecha notificación, motivo, número de póliza, tipo de siniestro, plazo de contestación. Cada campo tiene un confidence score.
3. **Agente de Triage** — Clasifica prioridad (alta/media/baja) según monto, plazo, tipo de siniestro, jurisdicción. Genera resumen ejecutivo de 3-5 líneas.
4. **Agente de Fichero** — Crea carpeta digital organizada con demanda original, ficha de datos, resultado de triage, póliza vinculada, antecedentes del asegurado.
5. **Jess — Drafting** — Genera borrador de contestación a partir de templates con partes estáticas (reserva federal, petitorio, encabezamiento) y partes dinámicas (negativas específicas, descripción del siniestro, cláusulas de póliza). Marca claramente las secciones que requieren completamiento humano.

El agente coordinador además sugiere asignación a abogados internos según expertise, seniority y carga de trabajo.

### Identidad visual

Paleta de Libra Seguros — minimalista, profesional, limpia:

- **Primario**: `#eb5d2a` (naranja Libra — solo para acentos, CTAs, indicadores de estado activo)
- **Secundario**: `#455362` (azul oscuro/navy — navegación, encabezados, texto principal)
- **Fondo**: `#ffffff` blanco con superficies en gris muy claro `#f7f8fa`
- **Texto**: `#1a1a1a` para cuerpo, `#6b7280` para texto secundario
- **Estados**: verde `#22c55e` (completado), amarillo `#eab308` (en proceso/atención), rojo `#ef4444` (urgente/error), gris `#9ca3af` (inactivo)
- **Bordes y separadores**: `#e5e7eb`
- **Tipografía**: sans-serif moderna (Inter, system-ui). Limpia, sin serif.
- **Border radius**: `6px` para cards, `8px` para modales. Nada excesivamente redondeado.
- **Espaciado**: generoso. Mucho aire. No apretar elementos.
- **Sombras**: sutiles, solo para elevación de cards y modales (`box-shadow: 0 1px 3px rgba(0,0,0,0.08)`).

El tono visual es: serio pero moderno. No es un dashboard de startup — es una herramienta de trabajo para abogados. Priorizar legibilidad y claridad sobre decoración.

### Estructura de la aplicación

La app tiene una **barra lateral izquierda** de navegación fija con las siguientes secciones:

#### 1. Panel Principal (home / overview)

Vista de resumen ejecutivo. Lo primero que ve el usuario al abrir la app.

**Barra superior:**
- Saludo contextual: "Buenos días, [nombre]" con fecha actual
- Indicadores rápidos en cards horizontales:
  - Casos activos (número total)
  - Pendientes de revisión (casos que necesitan intervención humana)
  - Vencimientos próximos (casos con plazo de contestación en los próximos 7 días)
  - Casos procesados hoy
- Cada indicador es clickeable y lleva a la vista filtrada correspondiente

**Cuerpo principal:**
- **Bandeja de entrada / Inbox** — Lista de items que requieren atención humana, ordenados por urgencia. Cada item muestra: nombre del caso, qué agente generó la tarea, qué acción se necesita (ej. "Validar extracción — 2 campos con baja confianza", "Aprobar asignación a Dr. Fernández", "Revisar borrador de contestación"). Click en cualquier item abre el detalle del caso.
- **Pipeline de casos activos** — Visualización horizontal tipo Kanban con columnas: Ingesta → Extracción → Triage → Borrador → Revisión → Revisión Humana → Completado. Cada caso es una card que se ve en la columna correspondiente a su etapa actual. Las cards muestran: carátula corta, prioridad (badge de color), plazo de contestación, abogado asignado (si hay). Click en una card abre el detalle del caso.

#### 2. Casos

Vista de gestión de casos. Dos sub-vistas:

**2a. Vista Pipeline (default):**
- El mismo Kanban que en el panel principal pero en vista completa, con más espacio.
- Las cards de caso son más detalladas: incluyen monto, jurisdicción, tipo de siniestro además de lo básico.
- Filtros en la parte superior: por prioridad, jurisdicción, tipo de siniestro, abogado asignado, rango de fechas.
- Badge en cada card mostrando hace cuánto tiempo está en esa etapa.

**2b. Vista Tabla:**
- Toggle para cambiar entre Pipeline y Tabla.
- Tabla con columnas: ID, Carátula, Demandante, Jurisdicción, Tribunal, Monto, Prioridad, Etapa actual, Abogado, Plazo contestación, Última actividad.
- Ordenable por cualquier columna. Filtrable. Búsqueda full-text.
- Exportar a CSV.

**Detalle de caso (se abre al clickear cualquier caso desde cualquier vista):**
- Vista completa del caso en un panel que ocupa el área principal (no un modal — una página completa).
- Encabezado: carátula, ID, badge de prioridad, badge de etapa actual, plazo de contestación con countdown.
- **Tab "Resumen"**: ficha de datos extraídos (todos los campos en formato key-value limpio), resumen de triage, confianza por campo (indicador visual: verde/amarillo/rojo).
- **Tab "Documentos"**: fichero digital — lista de documentos del caso (demanda PDF, ficha, póliza, antecedentes). Cada uno con botón de vista previa y descarga.
- **Tab "Borrador"**: borrador de contestación renderizado con secciones claramente marcadas. Las secciones que requieren completamiento humano aparecen resaltadas con fondo amarillo claro y un ícono de "requiere revisión". No necesita ser editable en esta versión — solo visualización.
- **Tab "Actividad"**: timeline cronológico de todo lo que pasó con este caso. Cada entrada muestra: timestamp, qué agente actuó, qué hizo, resultado resumido. Esto es la trazabilidad completa del caso. Las entradas son expandibles — click para ver más detalle del output del agente.
- **Tab "Asignación"**: muestra la sugerencia de asignación del sistema (abogado sugerido + razones) y el estado (pendiente/aprobada/modificada). Si está pendiente, botones para aprobar o reasignar.
- Botón "Volver" que regresa a la vista anterior.

#### 3. Agentes

Vista de monitoreo del sistema de agentes. Esta es la parte "mission control".

**Vista principal — Grid de agentes:**
- 6 cards grandes (1 coordinador + 5 sub-agentes), dispuestas en grid.
- Cada card muestra:
  - Nombre del agente (ej. "Agente de Triage")
  - Estado actual: Activo (procesando), En espera, Error — con indicador visual (dot de color + texto)
  - Si está activo: qué caso está procesando (nombre corto + link al caso)
  - Métricas rápidas: casos procesados hoy, tiempo promedio de procesamiento, tasa de éxito
  - Barra de actividad: mini sparkline o barra mostrando actividad de las últimas 24hs
- Click en cualquier card de agente abre el detalle del agente.

**Detalle de agente:**
- Nombre, descripción de su función, estado actual.
- **Sección "Actividad reciente"**: lista de las últimas 20 acciones del agente. Cada entrada: timestamp, caso procesado, resultado (éxito/error/requiere revisión), duración. Click en cualquier entrada lleva al caso correspondiente.
- **Sección "Rendimiento"**: métricas del agente — casos procesados (diario/semanal/mensual), tiempo promedio, tasa de campos con alta confianza (para extracción), tasa de éxito de triage, etc. Gráficos simples de barras o líneas.
- **Sección "Cola de trabajo"**: casos en espera de ser procesados por este agente, ordenados por prioridad.

**Vista de flujo del coordinador:**
- Cuando se clickea el Agente Coordinador, además de lo anterior, mostrar un diagrama visual del flujo: Ingesta → Extracción → Triage → Borrador → Revisión, con flechas conectando cada etapa, y dentro de cada nodo el estado actual (cuántos casos en esa etapa, si hay alguno procesándose). Esto es el "mapa del sistema" que da la sensación de ver todo el pipeline en acción.

#### 4. Equipo

Vista de gestión de abogados internos.

- Lista/grid de abogados del equipo.
- Cada card de abogado muestra: nombre, especialidad, seniority, casos asignados activos (número), carga de trabajo (indicador visual: liviana/normal/alta).
- Click en un abogado abre su perfil: lista de casos asignados (con links), historial de casos completados, métricas de desempeño.

#### 5. Métricas

Dashboard de analytics.

- **Fila 1**: KPIs principales en cards — total de demandas del mes, monto total reclamado, tiempo promedio recepción→contestación, distribución por prioridad (donut chart).
- **Fila 2**: gráfico de barras de volumen de demandas por mes (últimos 6 meses), gráfico de torta por tipo de siniestro.
- **Fila 3**: tabla de jurisdicciones con volumen y monto promedio, distribución de carga por abogado (barras horizontales).
- Filtros globales: período, jurisdicción, tipo de siniestro.

### Datos mock

Precargá la app con datos realistas para que sea completamente navegable:

**10-15 casos** en distintas etapas del pipeline, con datos como:

| Campo | Valores de ejemplo |
|-------|-------------------|
| Carátulas | "García, María c/ Libra Seguros S.A. s/ daños y perjuicios", "Rodríguez, Carlos A. c/ Libra Seguros S.A. s/ cobro de seguro", "Martínez, Lucía c/ Libra Seguros S.A. s/ incumplimiento contractual" |
| Jurisdicciones | CABA, Buenos Aires, Córdoba, Mendoza, Santa Fe |
| Tribunales | "Juzgado Nacional en lo Civil N° 42", "Juzgado Civil y Comercial N° 7 de La Plata", "Cámara de Apelaciones en lo Civil — Sala III" |
| Montos | Rango de ARS 1.500.000 a ARS 85.000.000 |
| Tipos de siniestro | Accidente vehicular, Responsabilidad civil, Mala praxis médica, Robo/hurto de vehículo, Incendio, Daño ambiental |
| Pólizas | POL-2024-00XXX y POL-2025-00XXX |
| Prioridades | Alta (2-3 casos), Media (5-6 casos), Baja (3-4 casos) |

**6 abogados internos:**

| Nombre | Especialidad | Seniority |
|--------|-------------|-----------|
| Dra. Valentina Herrera | Accidentes vehiculares, Responsabilidad civil | Senior |
| Dr. Martín Aguirre | Seguros patrimoniales, Incendio | Semi-senior |
| Dra. Camila Ruiz | Mala praxis, Daños personales | Senior |
| Dr. Federico López | Cobro de seguros, Contractual | Junior |
| Dra. Sofía Peralta | Daño ambiental, Responsabilidad civil | Semi-senior |
| Dr. Nicolás Vega | Accidentes vehiculares, Robo de vehículo | Junior |

**Datos de actividad de agentes:**
- Generá un historial realista de actividad para cada agente con timestamps de las últimas 2 semanas.
- Algunos casos deben estar en proceso (agente activo), otros completados, y 2-3 con flags de atención (baja confianza en extracción, borrador pendiente de revisión).
- El inbox debe tener 4-5 items pendientes de acción humana con distintos tipos de tarea.

**Borrador de contestación mock:**
- Para al menos 2 casos, incluí un borrador de contestación realista con estructura jurídica argentina: encabezamiento con datos del tribunal y partes, objeto ("contesta demanda"), sección de hechos (con negativas genéricas), sección de derecho (referencias a Código Civil y Comercial, Ley de Seguros 17.418), petitorio. Las secciones que requieren completamiento humano deben estar marcadas con placeholders del tipo "[COMPLETAR: argumentación específica sobre los hechos del siniestro]" y "[COMPLETAR: prueba a ofrecer]".

### Requerimientos técnicos

- Aplicación web standalone. Single page application.
- Framework: el que mejor funcione para generar rápido y que se vea profesional (React preferido, pero lo que Stitch maneje mejor).
- Responsive no es prioridad — optimizar para pantallas de escritorio (1280px+). Si se ve razonable en tablet, mejor, pero desktop-first.
- Navegación por URL/routing: cada sección debe tener su propia ruta para poder navegar con el browser.
- Transiciones suaves entre vistas. Nada brusco.
- Sin autenticación — acceso directo al dashboard.
- Los datos mock se cargan en memoria (no necesita backend).

### Lo que NO debe tener

- No incluir funcionalidad de upload de PDFs real.
- No incluir edición inline de borradores (solo visualización).
- No dark mode.
