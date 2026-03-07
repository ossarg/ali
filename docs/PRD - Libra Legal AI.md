---
tags:
  - project
  - plan
type: prd
status: active
started: 2026-02-20
project: "[[Libra]]"
---

# PRD — Libra Legal AI

## Misión

> Transformar la gestión de litigios de Libra Seguros de un proceso manual, fragmentado y reactivo en una operación legal estructurada, inteligente y proactiva — donde cada demanda se procesa en minutos, cada decisión se toma con datos, y el equipo legal dedica su tiempo a pensar en lugar de a administrar.

## 1. Problema

El área de litigios de Libra Seguros opera con procesos manuales y fragmentados. Las demandas judiciales se reciben en papel o PDF, se categorizan a criterio del gerente de legales, se distribuyen entre estudios jurídicos externos según expertise informal, y se rastrean en planillas Excel con estructura variable. No existe una base de datos unificada de litigios, no hay estandarización en las contestaciones, y la visibilidad sobre el estado de los casos es limitada.

La compañía está internalizando la gestión de juicios con un equipo legal propio. Sin una infraestructura que soporte ese cambio, el equipo heredaría los mismos procesos manuales a mayor escala.

## 2. Solución propuesta

Un sistema de agentes de IA que actúa como co-worker legal del equipo de litigios. No reemplaza al abogado; lo complementa ejecutando las tareas operativas, repetitivas y estandarizables del flujo de trabajo.

### Arquitectura conceptual

```
                    PDF / mail entrante
                           │
              ┌────────────▼────────────┐
              │    Agente Coordinador    │
              │  [modo síncrono]         │
              └──┬───────────────────────┘
                 │  handoff estructurado (JSON)
    ┌────────────▼──────────────────────────────────┐
    │                  Pipeline                      │
    │                                                │
    │  [1] Rachel — Ingesta                          │
    │      → procesa email, extrae metadatos         │
    │      → identifica tipo, adjuntos, partes base  │
    │      → NO procesa documentos adjuntos          │
    │                  │                             │
    │  [2] Data Processing Specialist — Extracción   │
    │      → lee PDFs adjuntos (demanda, cédula)     │
    │      → extrae 8 secciones estructuradas        │
    │      → confidence scores por campo             │
    │                  │                             │
    │         ┌────────┴────────┐                    │
    │         │  (si automático) │                   │
    │  [3] Triage Analyst    [3b] Agente de Borrador │
    │      → relevancia           → draft completo   │
    │      → score + flags        (en paralelo)      │
    │         └────────┬────────┘                    │
    │                  │                             │
    │  [4] Asignación a abogado                      │
    │      → gerente puede revocar                   │
    │      → si borrador manual: abogado lo dispara  │
    └───────────────────────────────────────────────┘
                 │
              ┌──▼──────────────────────────┐
              │    Agente Coordinador        │
              │  [modo asíncrono / auditor]  │
              │  - calidad y métricas        │
              │  - detección de errores      │
              │  - escalamiento humano       │
              └─────────────────────────────┘
```

#### Agente Coordinador — dos modos de operación

**Modo síncrono (runtime):**
- Orquesta el flujo end-to-end caso por caso
- Pasa handoffs estructurados (JSON mínimo) entre sub-agentes
- Detecta fallas y decide si reintentar o escalar a revisión humana
- Define qué pasa si un sub-agente no completa su tarea

**Modo asíncrono (auditor):**
- Audita outputs de los sub-agentes en batch
- Valida consistencia de datos entre etapas
- Detecta errores sistemáticos y patrones de fallo
- Calcula SLAs: tiempo de carga, precisión de extracción, tiempos de resolución
- Genera alertas de calidad para el equipo legal

#### Sub-agentes especializados

| Agente | Rol | Input | Output |
|--------|-----|-------|--------|
| Rachel (Intake) | Procesa email: remitente, asunto, cuerpo, metadatos, adjuntos identificados. No lee el contenido de los adjuntos. | Email | Metadatos + lista de adjuntos |
| Data Processing Specialist | Lee PDFs adjuntos. Extrae 8 secciones: identificación, partes, hechos, monto, cobertura, defensas, prueba, integridad documental. | PDFs de demanda | JSON estructurado + confidence scores |
| Triage Analyst | Clasifica relevancia (Baja/Media/Alta) según parámetros configurables. | JSON del DPS | Score + justificación + flags |
| Agente de Borrador | Genera draft completo según template de Libra. Corre en paralelo con triage si está habilitado automático; manual si no. | JSON del DPS | Draft editable con secciones estándar completas y placeholders |

**Principio clave**: cada sub-agente recibe **solo el contexto mínimo necesario** para su tarea. No accede al documento completo si no lo necesita. Esto mantiene las ventanas de contexto pequeñas y los costos controlados.

- **Modelo agnóstico**: la arquitectura permite intercambiar el LLM sin modificar la lógica de negocio.

## 3. Usuarios

| Usuario | Rol en el sistema |
|---------|-------------------|
| Encargado de litigios | Supervisión general. Revisa triage, valida asignaciones, monitorea métricas. |
| Abogados internos | Reciben ficheros y borradores. Completan la contestación. Aportan feedback. |
| Gerente de legales | Consulta dashboards. Audita decisiones del sistema. |

## 4. Requerimientos funcionales

### 4.1 Ingesta y revisión formal

- **IN**: Documento PDF de demanda judicial.
- **OUT**: Confirmación de recepción + resultado de revisión formal.
- El sistema recibe el PDF, extrae el texto y verifica formalidades procesales básicas (presencia de firma, identificación de partes, competencia del tribunal, plazos).
- Si detecta irregularidades formales, las señala para revisión humana.

### 4.2 Extracción de datos

- **IN**: Texto de la demanda.
- **OUT**: Objeto estructurado con campos extraídos.
- Campos mínimos requeridos:

| Campo | Tipo | Ejemplo |
|-------|------|---------|
| Demandante | string | "María García" |
| Demandado | string | "Libra Seguros S.A." |
| Jurisdicción | string | "CABA" |
| Tribunal | string | "Juzgado Civil N° 42" |
| Instancia | string | "Primera instancia" |
| Monto reclamado | number | 5000000 |
| Moneda | string | "ARS" |
| Fecha de notificación | date | 2026-02-15 |
| Motivo | string | "Daños y perjuicios - accidente de tránsito" |
| Número de póliza | string | "POL-2024-00123" |
| Tipo de siniestro | string | "Accidente vehicular" |
| Plazo de contestación | date | 2026-03-17 |

- El sistema debe manejar variaciones en el formato y lenguaje de las demandas.
- Confidence score por campo: si la extracción es incierta, se marca para validación humana.

### 4.3 Tabular view y base de datos

- **IN**: Datos extraídos de cada demanda.
- **OUT**: Registro en base de datos + vista tabular consultable.
- Cada demanda genera un registro en una base de datos estructurada.
- Vista tabular con filtros por: jurisdicción, monto, tipo de siniestro, estado, abogado asignado, fecha.
- Búsqueda full-text sobre el contenido de las demandas.
- Exportable a CSV/Excel para compatibilidad con flujos existentes.

### 4.4 Triage

- **IN**: Datos extraídos + texto de la demanda.
- **OUT**: Clasificación de prioridad + resumen ejecutivo.
- Categorización en niveles de prioridad (ej.: alta / media / baja) basada en:
  - Monto reclamado (umbrales configurables).
  - Plazo de contestación (urgencia temporal).
  - Tipo de siniestro (según histórico de complejidad).
  - Jurisdicción (algunas son más complejas que otras).
- Resumen ejecutivo de 3-5 líneas con los puntos clave de la demanda.
- Los parámetros de triage son configurables por el equipo legal.

### 4.5 Generación de fichero

- **IN**: Demanda + datos extraídos + resultado de triage + documentación interna vinculada.
- **OUT**: Carpeta organizada con todos los documentos del caso.
- El sistema crea un fichero digital por caso conteniendo:
  - Demanda original (PDF).
  - Ficha con datos extraídos.
  - Resultado de triage.
  - Póliza vinculada (si se encuentra en el sistema interno).
  - Antecedentes relevantes del asegurado.
- Estructura de carpetas estandarizada y nomenclatura consistente.

### 4.6 Borrador de contestación

- **IN**: Demanda + datos extraídos + template de contestación + contexto del caso.
- **OUT**: Borrador de contestación en formato editable.
- El borrador se genera a partir de templates con:
  - **Partes estáticas**: reserva de caso federal, petitorio, encabezamiento, formalismos procesales.
  - **Partes dinámicas**: negativas específicas a los hechos de la demanda, descripción del siniestro desde la perspectiva de la aseguradora, referencia a cláusulas de póliza aplicables.
- El sistema NO genera argumentación jurídica original ni interpretación legal. Se limita a las partes estandarizables.
- El borrador se entrega claramente marcado como draft, indicando qué secciones requieren revisión y completamiento por un abogado.

### 4.7 Asignación a abogados

- **IN**: Resultado de triage + perfil de abogados disponibles.
- **OUT**: Sugerencia de asignación.
- Criterios de asignación:
  - Área de expertise del abogado (ej.: accidentes vehiculares, responsabilidad civil, mala praxis).
  - Seniority relativo a la complejidad del caso.
  - Carga de trabajo actual.
- La asignación es una sugerencia que debe ser confirmada por el encargado de litigios.

### 4.8 Seguimiento de casos

- **IN**: Datos del caso (tribunal, carátula, número de expediente).
- **OUT**: Actualizaciones de estado procesal.
- Consulta periódica a fuentes públicas:
  - SAIJ (Sistema Argentino de Información Jurídica).
  - Sistemas de consulta de expedientes de cada jurisdicción.
- Alertas ante movimientos procesales relevantes (notificaciones, vencimientos, resoluciones).
- Actualización automática del estado en la base de datos.

### 4.9 Analytics y reporting

- **IN**: Base de datos de litigios.
- **OUT**: Dashboards y reportes.
- Métricas clave:
  - Volumen de demandas por período, tipo y jurisdicción.
  - Montos reclamados (total, promedio, distribución).
  - Tiempos de respuesta (recepción → contestación).
  - Distribución de carga entre abogados.
  - Tendencias y patrones (tipos de siniestro recurrentes, jurisdicciones problemáticas).

## 5. Requerimientos no funcionales

- **Auditabilidad**: cada acción del sistema queda registrada con timestamp, input, output y modelo utilizado. Los logs son consultables en lenguaje natural.
- **Eficiencia en tokens**: los sub-agentes operan con el contexto mínimo necesario. Los archivos de contexto se cargan de forma selectiva, no completa.
- **Agnóstico en modelo**: la arquitectura permite intercambiar el LLM sin modificar la lógica de negocio.
- **Configurabilidad**: umbrales de triage, templates de contestación, criterios de asignación y parámetros de extracción son configurables sin necesidad de cambiar código.
- **Supervisión humana**: ninguna acción con consecuencias legales se ejecuta sin validación humana. El sistema sugiere, el abogado decide.

## 6. Fases de desarrollo

### Fase 1 — PoC

**Objetivo**: demostrar viabilidad técnica procesando 1-2 demandas reales.

**Alcance**: ingesta de PDF → extracción de datos → tabular view → triage. Frontend React como interfaz de demo (mock data + primer caso real).

**Criterio de éxito**: el sistema procesa una demanda real y produce una ficha estructurada con datos extraídos correctamente y un triage coherente, sin intervención manual.

**Nota**: el backend (API + base de datos) se define con Nacho en función del stack elegido.

### Fase 2 — MVP

**Objetivo**: sistema funcional para uso interno con volumen limitado.

**Alcance**: agrega generación de fichero, borrador de contestación, asignación básica e integración con sistemas internos de Libra (pólizas, siniestros).

**Criterio de éxito**: un abogado interno puede recibir un caso procesado por el sistema y trabajar directamente sobre el borrador generado.

### Fase 3 — Producción

**Objetivo**: sistema completo operando con volumen real.

**Alcance**: agrega seguimiento de casos, analytics, interfaz mission control, escalado a 100-200 demandas/mes.

**Criterio de éxito**: el equipo legal opera con el sistema como herramienta principal de gestión de litigios.

### Fase 4 — Expansión (módulos adicionales)

Módulos independientes del flujo principal de demandas. Se planifican ahora, se ejecutan en orden de prioridad a definir.

| Módulo | Descripción |
|--------|-------------|
| **Pericias** | Gestión del flujo de pericias judiciales: solicitud, seguimiento, recepción de informes, integración al expediente. |
| **Trámite de oficios** | Automatización del seguimiento de oficios judiciales: envío, acuse de recibo, respuesta. |
| **Updates regulatorios SSN** | Monitoreo de la Superintendencia de Seguros de la Nación: nuevas resoluciones, circulares, cambios normativos. Alertas proactivas al equipo legal. |

## 7. Puntos abiertos

| # | Punto | Impacto | Necesario para | Owner |
|---|-------|---------|----------------|-------|
| 1 | Sistemas internos de Libra: API o acceso a BD de pólizas/siniestros | Define integraciones y acceso a datos | MVP | Nacho |
| 2 | Template de contestación de demanda | Define lógica de generación de borradores | MVP | Equipo legal |
| 3 | Muestras de demandas reales (anonimizadas) | Desarrollo y testing | PoC | Equipo legal |
| 4 | Planillas Excel actuales de seguimiento | Define schema de datos y migración | PoC | Nacho |
| 5 | Stack técnico y framework agentic | Define arquitectura de implementación | PoC | Juan + Nacho |
| 6 | Backend: API + base de datos | Define infraestructura del PoC y más allá | PoC | Juan + Nacho |
| 7 | Entorno de deployment | Define infraestructura productiva | MVP | Nacho |
| 8 | Restricciones regulatorias SSN sobre IA | Puede condicionar arquitectura | MVP | Equipo legal |
| 9 | Métricas de éxito cuantificables por fase | Define criterios de aceptación | Todas | Nacho + Juan |
