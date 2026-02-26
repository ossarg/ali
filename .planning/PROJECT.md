# Libra Legal AI

## What This Is

Sistema de agentes de IA que automatiza el flujo de trabajo del departamento de litigios de Libra Seguros. El flujo se dispara cuando llega un email con la notificación de demanda. El agente procesa todo automáticamente y notifica a los abogados en los momentos que requieren intervención humana. Hecho a medida para aseguradoras.

## Users

- **Abogados de Libra**: Intervienen en momentos específicos del flujo (revisión de casos, aprobación de asignaciones). No configuran el agente ni acceden a la base de datos directamente — el agente hace ese trabajo por ellos y los notifica cuando necesita validación.

## Trigger

- **Email**: Llega a una casilla dedicada con la notificación de la demanda (adjunto PDF). Este email dispara el flujo automatizado.

## Core Value

Automatizar tareas operativas, repetitivas y estandarizables del flujo de litigios para reducir costos externos, mejorar tiempos de respuesta y generar trazabilidad completa.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Ingesta y revisión formal de demandas PDF
- [ ] Extracción de datos estructurados (demandante, monto, tribunal, póliza, etc.)
- [ ] Base de datos estructurada con vista tabular
- [ ] Triage automático con clasificación de prioridad
- [ ] Generación de ficheo por caso
- [ ] Borrador de contestación (template estático + dinámico)
- [ ] Asignación automática a abogados
- [ ] Seguimiento de casos (consulta SAIJ y sistemas judiciales)
- [ ] Analytics y reporting

### Out of Scope

- [Argumentación jurídica original] — El sistema solo genera borradores estandarizables, no interpreta o crea argumentación legal
- [Integración con sistemas internos] — Pendiente de definición (ERP, gestión de siniestros, pólizas)
- [Mobile app] — Web-first para uso interno
- [ódulo deM pagos] — No relacionado con flujo de litigios

## Context

- **Organización**: Libra Seguros (aseguradora)
- **Equipo**: Departamento de litigios en proceso de internalización
- **Estado actual**: Procesos manuales con Excel, sin base de datos unificada
- **Volumen objetivo**: 100-200 demandas/mes en producción
- **Documentación existente**: PRD detallado y Scope of Work (SVG)
- **Restricciones regulatorias**: Sin restricciones SSN identificadas

## Constraints

- **Modelo agnóstico**: La arquitectura debe permitir cambiar de LLM sin modificar lógica de negocio
- **Auditabilidad**: Cada acción del sistema queda registrada con timestamp, input, output y modelo
- **Supervisión humana**: Ninguna acción con consecuencias legales se ejecuta sin validación humana
- **Eficiencia en tokens**: Sub-agentes operan con contexto mínimo necesario

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Arquitectura multi-agente | Cada skill acotado y optimizado, contexto mínimo por tarea | — Pending |
| Fases PoC → MVP → Producción | Permite validar incrementalmente antes de escalar | — Pending |
| Templates de contestación estáticos + dinámicos | Estandariza partes repetitivas, preserva control humano en argumentación | — Pending |

---
*Last updated: 2026-02-26 after initialization and adjustments*
*Adjustments: email trigger, user model (abogados no acceden a DB)*
