# CLAUDE.md — Backend Libra Legal AI

## Stack
- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **DB:** Neon PostgreSQL (pg driver)
- **Entry point:** `src/index.ts`
- **Dev:** `npm run dev` (tsx watch)

## Estructura
```
backend/
├── src/
│   ├── index.ts          — servidor principal, rutas, middleware
│   ├── db/client.ts      — pool de conexión a Neon
│   ├── middleware/auth.ts — roles: admin > gerente > abogado
│   └── routes/
│       ├── casos.ts      — GET /api/casos, GET /api/casos/:id
│       ├── triage.ts     — GET/PUT /api/triage/rules, POST /api/triage/:id/confirm
│       ├── metrics.ts    — GET /api/metrics
│       └── agents.ts     — GET /api/agents (estado del pipeline)
├── db/
│   └── migration_poc.sql — migración ejecutada en Neon
└── .env.example
```

## Variables de entorno requeridas
```
DATABASE_URL=postgresql://...   # Neon — NO commitear
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## Roles y permisos
- `abogado` — solo lectura
- `gerente` — lectura + editar reglas de triage + aprobar asignaciones
- `admin` — todo

Auth por header `X-User-Role` (PoC). Reemplazar con JWT antes de producción.

## DB — Convenciones
- Estados como `SMALLINT`: 1=Baja, 2=Media, 3=Alta
- Enum central en `src/middleware/auth.ts`
- Nunca strings para estados en la DB

## Reglas
- Nunca commitear DATABASE_URL ni credenciales
- Nunca modificar tablas de Rachel sin aprobación de Nacho
- Para cambios de schema: agregar archivo en `db/` y avisar antes de ejecutar
