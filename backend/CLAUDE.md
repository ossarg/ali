# CLAUDE.md - Backend

## Stack
- Go (1.23+) + Echo v4 + GORM
- PostgreSQL via Neon (managed, serverless)
- JWT authentication with role + capabilities

## Structure
```
backend/
├── cmd/server/main.go          # Entrypoint
├── internal/
│   ├── config/config.go        # Viper-based config (DATABASE_URL, JWT_SECRET, CORS)
│   ├── database/postgres.go    # GORM connection to Neon
│   ├── middleware/jwt.go       # JWT validation + RequireCapability
│   └── router/router.go        # Echo router, all routes defined here
├── go.mod
├── .env.example
└── .gitignore
```

## Auth
- All `/api/v1/*` routes require `Authorization: Bearer <token>`
- JWT claims: `user_id`, `email`, `role` (abogado|gerente|admin), `capabilities` ([]string)
- `RequireCapability("cap")` middleware used per-route for granular access control
- Example capabilities: `cases:read`, `cases:write`, `triage:config`

## Rules
- **English only**: file names, folders, variables, functions, structs
- Never commit `.env` or credentials
- Never modify Rachel's tables without Nacho approval
- No Redis for PoC — add when needed
- Placeholders in router until controllers are implemented

## Running locally
```bash
cp .env.example .env
# fill in DATABASE_URL and JWT_SECRET
go run cmd/server/main.go
```

## Environment variables
| Variable | Required | Default | Description |
|---|---|---|---|
| DATABASE_URL | yes | — | Neon PostgreSQL connection string |
| JWT_SECRET | yes | — | Secret for signing/verifying JWTs |
| SERVER_PORT | no | 8080 | HTTP port |
| ENVIRONMENT | no | development | development/production |
| CORS_ALLOWED_ORIGINS | no | http://localhost:5173 | Comma-separated allowed origins |

## Pendientes de seguridad
- [ ] **JWT blacklist**: implementar invalidación de tokens en logout (Redis o tabla `revoked_tokens`). Por ahora logout es client-side only.
