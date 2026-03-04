# Long-Term Memory

_Tres capas: Constitutional (nunca expira), Strategic (trimestral), Operational (30 días sin uso → archivo)._
_Metadata: [trust:0-1|src:direct/observed/inferred|used:FECHA|hits:N]_

---

## Constitutional — Reglas duras, nunca expiran

- [trust:1.0|src:direct|used:2026-03-02|hits:2] NUNCA pushear a `main`. Branches por sesión/tópico.
- [trust:1.0|src:direct|used:2026-03-02|hits:2] NUNCA pushear tokens, API keys o variables de entorno al repo.
- [trust:1.0|src:direct|used:2026-03-02|hits:2] El canal `#rachel` es exclusivo de Rachel. Ali sin acceso.
- [trust:1.0|src:direct|used:2026-03-02|hits:2] Ninguna acción con consecuencias legales sin validación humana.
- [trust:1.0|src:direct|used:2026-03-02|hits:2] Safety gate: preguntar antes de cambios que afecten runtime, datos, costo, auth, routing o outputs externos.

---

## Strategic — Estado del proyecto, estable por meses

- [trust:1.0|src:direct|used:2026-03-02|hits:4] Repo: ossarg/ali en GitHub. Local: /home/legales/ali.
- [trust:1.0|src:direct|used:2026-03-02|hits:3] Equipo: Nacho (lead, infra, sistemas Libra), Juan (frontend/arquitectura), Ali (coordinador).
- [trust:1.0|src:direct|used:2026-03-02|hits:3] Agentes activos: Ali (canal #ali, #general) y Rachel (canal #rachel, procesamiento de mails legales).
- [trust:1.0|src:direct|used:2026-03-02|hits:2] Coordinador opera en modo síncrono (runtime) y asíncrono (auditor) — un solo agente, dos modos.
- [trust:1.0|src:direct|used:2026-03-02|hits:2] Sub-agentes reciben contexto mínimo (handoffs JSON). No acceden al documento completo.
- [trust:1.0|src:direct|used:2026-03-02|hits:2] Módulos pericias, oficios y SSN son Fase 4, independientes del pipeline principal.
- [trust:0.9|src:direct|used:2025-12-23|hits:1] Backend del PoC a definir con Nacho. Frontend: webapp React en docs/webapp-poc/.

---

## Operational — Contexto activo, se archiva a los 30 días sin uso

- [trust:1.0|src:direct|used:2025-12-23|hits:1] Branch activo: sesion/2025-12-23. PR pendiente de abrir.
- [trust:1.0|src:direct|used:2025-12-23|hits:1] Rachel configurada con bot propio de Discord. Pendiente prueba en #rachel.
- [trust:0.8|src:observed|used:2025-12-23|hits:1] Loop 6 del artículo de AtlasForge: irrelevante según Juan.
- [trust:1.0|src:direct|used:2025-12-23|hits:1] Loops 1-5 implementados. Loops 7-9 en Fase B/C.
- [trust:1.0|src:observed|used:2026-03-03|hits:6] Gap activo sin sesión humana: ~70 días (última sesión 2025-12-23). Cron corriendo normalmente.
