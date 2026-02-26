---
tags:
  - project
  - plan
type: scope-of-work
status: active
started: 2026-02-20
project: "[[Libra]]"
---

# Scope of Work — Libra Legal AI

## 1. Descripción del proyecto

Libra Seguros gestiona actualmente su área de litigios de forma manual: las demandas judiciales se reciben, categorizan y asignan a estudios jurídicos externos mediante procesos manuales y planillas de Excel. La compañía ha decidido internalizar progresivamente la gestión de juicios, incorporando un equipo legal interno.

Este proyecto propone diseñar y construir un sistema de agentes de IA que funcione como co-worker legal del equipo de litigios. El sistema automatiza la recepción, análisis, categorización y preparación de respuestas a demandas judiciales, reduciendo la carga operativa y mejorando la calidad y consistencia del trabajo legal.

El enfoque es modular: cada capacidad del sistema se implementa como un skill especializado, coordinado por un agente principal. El sistema es agnóstico en modelo LLM, permitiendo flexibilidad en la elección de proveedor.

## 2. Objetivos

- **Reducción de costos directos** — Disminuir la dependencia de estudios jurídicos externos y optimizar el dimensionamiento del equipo interno.
- **Mejora de productividad** — Automatizar tareas repetitivas (extracción de datos, categorización, generación de borradores) para que los abogados se concentren en trabajo de interpretación jurídica.
- **Calidad y consistencia** — Estandarizar las etapas de revisión, categorización y respuesta. Reducir la variabilidad entre profesionales y minimizar errores formales.
- **Mejora de tiempos** — Reducir el tiempo entre la recepción de una demanda y la preparación de la contestación.
- **Trazabilidad y datos** — Construir una base de datos estructurada de litigios que hoy no existe, habilitando reporting, análisis de tendencias y toma de decisiones informada.
- **Escalabilidad operativa** — Permitir que el equipo legal maneje un volumen creciente de casos sin incremento proporcional de headcount.

## 3. Alcance

### 3.1 Funciones del sistema

El sistema cubre el ciclo de vida de una demanda judicial desde su recepción hasta la preparación de la contestación:

| # | Función | Descripción |
|---|---------|-------------|
| 1 | **Ingesta y revisión formal** | Recepción de la demanda (PDF). Validación de formalidades procesales. |
| 2 | **Extracción de datos** | Identificación y extracción estructurada de: demandante, jurisdicción, monto, fecha de notificación, tribunal, instancia, motivo, número de póliza. |
| 3 | **Tabular view** | Generación de una vista tabular con los datos extraídos, conformando la base de datos de litigios. |
| 4 | **Triage** | Categorización de la demanda según parámetros predefinidos (plazo, monto, complejidad). Clasificación por prioridad e importancia. |
| 5 | **Generación de fichero** | Creación de un "caso" individual con la demanda, documentación vinculada (póliza, antecedentes) y metadata. Organización en carpeta accesible. |
| 6 | **Borrador de contestación** | Generación de un borrador de respuesta basado en templates. Partes estáticas (reserva de caso federal, petitorio) + partes dinámicas (negativas, hechos). |
| 7 | **Asignación a abogados** | Asignación de casos al abogado interno adecuado según área de expertise, seniority y carga de trabajo. |
| 8 | **Seguimiento de casos** | Monitoreo del estado procesal de los casos utilizando fuentes públicas (SAIJ y otros sistemas judiciales online). |
| 9 | **Analytics y reporting** | Dashboards con métricas de litigios: volumen, montos, tiempos de respuesta, distribución por tipo, tendencias. |

### 3.2 Interfaz

El sistema incluirá una interfaz tipo "mission control" para que el equipo legal pueda:

- Visualizar el estado de cada caso y la actividad de los agentes.
- Consultar logs en lenguaje natural.
- Auditar y supervisar las decisiones del sistema.
- Acceder a los ficheros y borradores generados.

### 3.3 Fuera de alcance

- Integración directa con sistemas de tribunales digitales (presentación electrónica de escritos).
- Gestión de etapas pre-judiciales (mediación, siniestros administrativos).
- Asesoramiento jurídico autónomo o interpretación legal sin supervisión humana.

## 4. Enfoque de implementación

El proyecto se desarrolla en fases incrementales, priorizando funcionalidades que demuestren valor rápido:

| Fase | Foco | Objetivo |
|------|------|----------|
| **PoC** | Ingesta, extracción, tabular view, triage | Demostrar viabilidad técnica con 1-2 demandas reales. |
| **MVP** | Fichero, borrador de contestación, asignación básica | Sistema funcional para uso interno con volumen limitado. |
| **Producción** | Seguimiento de casos, analytics, mission control, escala | Sistema completo operando con volumen real (~100-200 demandas/mes). |

## 5. Supuestos

- Las demandas llegan en formato PDF (nativo o digitalizado).
- El volumen estimado es de 100 a 200 demandas por mes.
- Se cuenta con acceso a los datos, sistemas internos y modelos de documentos (demandas, contestaciones, pólizas) de Libra Seguros.
- El sistema es agnóstico en modelo LLM; se definirá el modelo primario al iniciar el PoC.
- No existen restricciones regulatorias conocidas que impidan el procesamiento de documentos legales con IA.

## 6. Puntos abiertos

- [ ] Identificar y documentar los sistemas internos existentes (gestión de siniestros, pólizas, ERP).
- [ ] Obtener templates de contestación de demanda (anonimizados).
- [ ] Obtener muestras de demandas reales (anonimizadas) para desarrollo y testing.
- [ ] Obtener muestra de las planillas Excel actuales de seguimiento de casos.
- [ ] Definir modelo LLM primario y framework agentic para el PoC.
- [ ] Definir stack técnico y entorno de deployment (cloud, on-prem, restricciones).
- [ ] Validar si existen restricciones regulatorias de la SSN sobre procesamiento de datos con IA.
- [ ] Definir métricas de éxito para cada fase.
