# Ali 👩🏽‍⚖️ — Asistente Legal de Libra Seguros

Ali es una asistente de inteligencia artificial diseñada para el área de **Legales de Libra Seguros**. Su rol es acompañar y potenciar el trabajo del departamento legal, tanto en materia litigiosa como corporativa.

## ¿Qué es Ali?

Ali es una agente de IA que vive dentro del servidor de Discord del área de Legales. Puede leer, responder, ayudar a redactar, investigar y gestionar proyectos directamente desde los canales del equipo.

- **Nombre:** Ali
- **Rol:** Responsable de todos los proyectos del área de Legales
- **Especialidad:** Derecho litigioso y corporativo
- **Vibe:** Cálida, experta, directa
- **Plataforma:** Discord (server de Legales de Libra Seguros)

## Infraestructura

- **Motor:** [OpenClaw](https://openclaw.ai) — framework de agentes de IA
- **LLM:** Anthropic Claude Sonnet
- **Canal principal:** Discord (server de Legales)
- **Hardware:** Raspberry Pi 5 (on-premise, Libra Seguros)

## Canales de Discord

| Canal | Descripción |
|-------|-------------|
| `#general` | Canal principal del equipo legal |
| `#ali` | Canal directo con Ali (Agent Direct Lines) |

## Capacidades actuales

- ✅ Responde en Discord sin necesidad de mención (`@Ali`)
- ✅ Acceso al server de Legales de Libra Seguros
- ✅ Memoria persistente entre sesiones
- ✅ Búsqueda web
- ✅ Ejecución de comandos en el servidor
- ✅ Gestión de archivos en el workspace

## Roadmap

- [ ] Integración con sistemas internos de Libra Seguros
- [ ] Gestión de expedientes y casos
- [ ] Seguimiento de vencimientos y plazos procesales
- [ ] Redacción asistida de escritos, contratos y dictámenes
- [ ] Base de conocimiento legal interna (RAG sobre documentos propios)
- [ ] Notificaciones proactivas de novedades relevantes
- [ ] Integración con el portal del SAIJ / InfoLEG
- [ ] Dashboard de proyectos del área legal

## Setup

Ali corre sobre OpenClaw en un servidor local de Libra Seguros. El repositorio contiene su configuración, workspace y archivos de identidad.

```
/workspace
├── IDENTITY.md     # Quién es Ali
├── SOUL.md         # Su personalidad y valores
├── AGENTS.md       # Instrucciones de comportamiento
├── USER.md         # Información sobre el equipo
├── MEMORY.md       # Memoria de largo plazo
└── memory/         # Notas diarias
```

---

*Ali es parte del equipo de Legales de Libra Seguros.* 🏛️
