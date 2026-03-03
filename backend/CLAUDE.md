# CLAUDE.md — Backend Libra Legal AI (Go)

## Stack
- **Lenguaje:** Go 1.25
- **Framework:** Echo v4
- **ORM:** GORM + postgres driver
- **Cache:** Redis
- **Config:** Viper
- **Docs:** Swagger (swaggo)
- **Entry point:** `cmd/server/main.go`

## Estructura
```
backend/
├── cmd/server/main.go         — entry point
├── pkg/
│   ├── app/
│   │   ├── config/            — Viper, singleton Load/Get
│   │   ├── controllers/       — Echo handlers (bind/validate/respond)
│   │   ├── middleware/        — JWT auth, roles
│   │   ├── router/            — InitRouter()
│   │   └── services/          — Orchestrators (lógica + coordinación)
│   └── services/
│       ├── db/                — GORM + PostgreSQL
│       ├── cache/             — Redis
│       └── libra/             — Cliente sistema Libra (futuro)
├── migrations/                — SQL migrations
├── Dockerfile                 — Multi-stage Alpine
├── docker-compose.yml         — postgres + redis + server
└── Makefile
```

## Comandos
```bash
make run          # levanta todo con Docker
make run-detached # detached mode
make stop         # baja todo
make test         # tests
make swagger      # genera docs
make fmt && make tidy
```

## Variables de entorno requeridas
- DATABASE_URL
- JWT_SECRET (mín. 32 chars)
- REDIS_URL (default: redis://localhost:6379/0)

## Roles
- abogado — solo lectura
- gerente — lectura + editar reglas de triage
- admin   — todo

## Convenciones DB
- Estados como SMALLINT: 1=Baja, 2=Media, 3=Alta
- Nunca modificar tablas de Rachel sin aprobación de Nacho

## Reglas
- Nunca commitear .env ni credenciales
- Para cambios de schema: agregar SQL en migrations/ y avisar antes de ejecutar
