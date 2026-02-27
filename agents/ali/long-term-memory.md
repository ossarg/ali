# Long-Term Memory

_Lo que siempre debo recordar. Permanente hasta que se actualice explícitamente._

## Proyecto
- **Repo:** ossarg/ali en GitHub
- **Regla crítica:** nunca pushear a main. Branches por sesión/tópico.
- **Push al cierre de cada sesión.**

## Equipo
- **Nacho** (nachgrasso) — lead del proyecto, decisiones de infra y sistemas Libra
- **Juan** (juan.mazzochi) — colaborador, frontend/arquitectura, aportó webapp PoC

## Configuración
- **Canal #ali:** responder sin mención
- **Canal #rachel:** solo Rachel, Ali no tiene acceso
- **Workspace:** /home/legales/.openclaw/workspace
- **Repo local:** /home/legales/ali

## Agentes
- **Ali:** agente coordinador, Sonnet, canal #ali y #general
- **Rachel:** procesamiento de mails legales, Sonnet, canal #rachel

## Decisiones tomadas
- Coordinador opera en modo síncrono (runtime) y asíncrono (auditor) — un solo agente, dos modos
- Cada sub-agente recibe contexto mínimo (handoffs JSON, no documento completo)
- Módulos de pericias, oficios y SSN son Fase 4, independientes del pipeline principal
- Backend del PoC a definir con Nacho

