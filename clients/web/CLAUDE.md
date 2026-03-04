# CLAUDE.md — Webapp PoC Libra Legal AI

## Stack
- **Framework:** React + TypeScript
- **Build:** Vite
- **Estilos:** Tailwind CSS (no modificar clases existentes sin aprobación de Juan)
- **Entry point:** `src/main.tsx`
- **Dev:** `npm run dev` (puerto 5173)

## Estructura
```
src/
├── App.tsx               — router principal
├── components/
│   └── Layout.tsx        — sidebar + navegación
├── data/
│   └── mockData.ts       — datos de prueba (reemplazar por API calls)
├── lib/
│   └── utils.ts          — utilidades
└── pages/
    ├── Home.tsx           — dashboard principal
    ├── Cases.tsx          — listado de casos
    ├── CaseDetail.tsx     — detalle de caso
    ├── Agents.tsx         — estado de agentes del pipeline
    ├── AgentDetail.tsx    — detalle de agente
    ├── Metrics.tsx        — métricas y analytics
    ├── Team.tsx           — equipo de abogados
    └── LawyerDetail.tsx   — detalle de abogado
```

## Backend
- API en `http://localhost:3001`
- Auth por header `X-User-Role: abogado | gerente | admin`
- Endpoints: `/api/casos`, `/api/triage`, `/api/metrics`, `/api/agents`

## Reglas estrictas
- **No modificar estilos visuales** sin aprobación explícita de Juan
- **No cambiar estructura de componentes existentes** sin avisar antes
- Si una nueva feature modifica una vista existente → marcar explícitamente antes de implementar
- Mock data en `mockData.ts` se mantiene como fallback durante desarrollo

## Cambios pendientes aprobados
- [ ] "MISSION CONTROL" → "Panel de Control"
- [ ] Agregar tab "Documentos" en sidebar
- [ ] Agregar sección "Configuración" (reglas de triage, solo gerente/admin)
- [ ] Reemplazar mock data por llamadas reales a la API
