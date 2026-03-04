# CLAUDE.md — clients/web

## What this is
React + TypeScript + Vite frontend for Libra Legal AI.
Internal app — no SEO, no SSR needed.

## Stack
- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- React Router v7
- date-fns, lucide-react, recharts

## Dev setup
```bash
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:8080
npm run dev   # http://localhost:3000
```

## Rules

### Code
- TypeScript strict — no `any`. Define types for all API responses.
- Use React Router `useNavigate` / `<Link>` for navigation. Never `window.location.href`.
- Error and loading states are mandatory on every page that fetches data.
- No inline styles — Tailwind only.

### API (`src/lib/api.ts`)
- Base URL: `VITE_API_URL` (default `http://localhost:8080`)
- Auth: `Authorization: Bearer <token>` header — NOT `X-User-Role`
- API paths must match backend exactly: `/api/v1/...` (English, no `/api/casos`)
- The `X-User-Role` / `X-User-Id` headers are PoC stubs — remove when JWT auth lands

### Types
- All API response shapes live in `src/types/` — NOT inlined as `any`
- `mockData.ts` types (Stage, Priority, etc.) use Spanish labels for display; backend uses English enums (intake, triage, review, closed) — the mapping layer lives in `src/lib/api.ts` or a dedicated `src/lib/transforms.ts`

### Visual changes
**No visual changes without Juan's approval.**
Logic, API wiring, and types are free game. Layout, colors, and components are not.

### No unused dependencies
The following must NOT be in `package.json` (they have no place in a Vite frontend):
- `better-sqlite3` — Node.js native, server-side only
- `express` — server-side only
- `@google/genai` — backend concern
- `dotenv` — Vite handles env vars natively via `import.meta.env`

## Project structure
```
src/
├── components/     # Shared UI components
├── data/           # mockData.ts (replace with API calls progressively)
├── lib/
│   ├── api.ts      # HTTP client + all API functions
│   └── utils.ts    # cn() and other helpers
├── pages/          # One file per route
└── types/          # API response types (add as endpoints are implemented)
```

## Current state (PoC)
| Page       | Status                              |
|------------|-------------------------------------|
| Home       | Mock data only                      |
| Cases      | Wired to API (endpoint pending)     |
| CaseDetail | Mock data only                      |
| Agents     | Mock data only                      |
| Metrics    | Mock data only                      |
| Team       | Mock data only                      |
| Documentos | Placeholder                         |

Pages migrate from mock to API as backend endpoints are implemented.

## Auth (pending)
- PoC: `VITE_USER_ROLE` env var + plain headers (stub)
- Target: JWT from `POST /api/v1/auth/login`, stored in memory (not localStorage), sent as `Authorization: Bearer`
