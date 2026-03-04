# Backend Onboarding — Libra Legal AI

> Para: Woz (software engineer)  
> De: Ali (orquestador)  
> Fecha: 2026-03-03

---

## Repo
`git@github.com:ossarg/ali.git`  
Rama activa: `feature/case-model` (desde `main`)  
Backend en: `/backend/`

---

## Stack
- **Go 1.24** + **Echo v4** + **GORM**
- **PostgreSQL** local vía Docker (dev), AWS RDS en producción (a definir)
- **JWT** — `golang-jwt/jwt/v5`
- **Swagger** — Swaggo (`swag init` genera los docs)
- **Viper** — config via env vars

---

## Levantar el stack

```bash
cd backend
cp .env.example .env   # completar JWT_SECRET con: openssl rand -hex 32
make up                # levanta postgres:16-alpine + server en Docker
make migrate           # corre migrations en orden
```

Swagger: `http://localhost:8080/swagger/index.html`  
Health: `http://localhost:8080/health`

---

## Estructura

```
backend/
├── cmd/server/main.go          # entrypoint, DI manual
├── internal/
│   ├── apierrors/              # errores centralizados + Echo error handler
│   ├── config/                 # Viper (DATABASE_URL, JWT_SECRET, SERVER_PORT, CORS)
│   ├── controllers/            # auth_controller.go
│   ├── database/               # GORM connection, pool 10max/5idle
│   ├── dto/                    # request/response structs
│   ├── middleware/             # JWTMiddleware() + RequireCapability("cap")
│   ├── models/                 # User, Role
│   ├── repositories/           # interfaces + implementaciones
│   ├── router/                 # Echo router, Swagger montado en /swagger/*
│   └── services/               # lógica de negocio + tests
├── migrations/                 # archivos .sql numerados (001_, 002_, ...)
├── scripts/migrate.sh          # corre migrations contra DATABASE_URL
├── Makefile
├── Dockerfile                  # multi-stage, imagen final ~20MB
└── docker-compose.yml          # postgres + server
```

---

## Auth

### Endpoints
- `POST /api/v1/auth/login` — `{email, password}` → JWT + user info
- `POST /api/v1/auth/logout` — client-side (JWT blacklist pendiente — ver CLAUDE.md)

### JWT Claims
```go
type Claims struct {
    UserID       string   `json:"user_id"`
    Email        string   `json:"email"`
    Role         string   `json:"role"`         // "abogado" | "gerente" | "admin"
    Capabilities []string `json:"capabilities"` // ["cases:read", "triage:config", ...]
}
```

### Roles (SMALLINT en DB)
| Valor | Nombre   | Capabilities base |
|-------|----------|-------------------|
| 1     | abogado  | cases:read |
| 2     | gerente  | cases:read, cases:write, triage:config |
| 3     | admin    | cases:read, cases:write, triage:config, users:manage |

Se pueden agregar capabilities extras por usuario encima del rol base.

### Proteger un endpoint
```go
// Solo requiere JWT válido:
api.GET("/cases", casesController.List)

// Requiere JWT + capability específica:
api.PUT("/triage/rules", triageController.Update, appMiddleware.RequireCapability("triage:config"))
```

---

## Base de datos

### Reglas
- **Enums como SMALLINT** — nunca VARCHAR para valores fijos; el mapeo vive en el servidor
- **UUIDs** para todas las PKs (`gen_random_uuid()`)
- **Soft delete** — `deleted_at TIMESTAMP NULL` en todas las tablas principales
- **English** — nombres de tablas y columnas en inglés

### Migrations
Archivo nuevo = siguiente número en secuencia:
```
migrations/
├── 001_create_users_table.sql
├── 002_seed_users.sql
└── 003_create_firms_table.sql   ← próximo
```

### Usuario seed
```
email:    admin@libraseguros.com.ar
password: libra2026
role:     3 (admin)
```

---

## Próximo paso: `firms` + `cases`

### firms
```sql
CREATE TABLE firms (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(255) NOT NULL UNIQUE,
    address      TEXT,
    phone        VARCHAR(50),
    email        VARCHAR(255),
    type         SMALLINT NOT NULL,  -- 1=defense, 2=plaintiff, 3=both
    is_active    BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at   TIMESTAMP NULL
);
```

### cases (borrador — 3 preguntas abiertas para Juan)
```sql
CREATE TABLE cases (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_number       VARCHAR(50),
    case_number        VARCHAR(100),
    title              TEXT NOT NULL,
    policy             VARCHAR(50),
    case_type          SMALLINT NOT NULL,  -- 1=lawsuit, 2=mediation, 3=third_party
    action_type        SMALLINT NULL,      -- 1=direct_claim, 2=guarantee_citation (¿solo juicios?)
    court              VARCHAR(100),
    tribunal           VARCHAR(150),
    defense_firm_id    UUID REFERENCES firms(id),
    plaintiff_firm_id  UUID REFERENCES firms(id),
    assigned_user_id   UUID REFERENCES users(id),
    status             SMALLINT NOT NULL DEFAULT 1,  -- 1=open, 2=closed, 3=suspended
    estimated_amount   NUMERIC(18,2),
    incident_date      DATE,
    opened_at          DATE,
    pipeline_stage     VARCHAR(50) DEFAULT 'intake',
    created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at         TIMESTAMP NULL
);
```

**Preguntas abiertas para Juan antes de crear la migration de cases:**
1. ¿`action_type` aplica solo a juicios o también a mediaciones?
2. ¿El webapp necesita ver actor/demandado por separado en el PoC, o alcanza la carátula?
3. ¿Los stages `intake → triage → review → closed` cierran para el flujo?

---

## Reglas del proyecto

- **English only** — archivos, carpetas, variables, funciones, structs, columnas DB
- **Nunca commitear `.env`** ni credenciales
- **Cada endpoint nuevo** — anotaciones Swaggo antes de commitear (`make swagger` regenera docs)
- **Nunca modificar tablas de Rachel** en Neon sin aprobación de Nacho
- **Branches** — nunca pushear a `main` directamente; PR por feature
- **Tests** — cada service nuevo necesita tests unitarios con mocks

---

## DI (Dependency Injection)

Manual, siguiendo el patrón de los proyectos internos de Libra. Todo se cablea en `main.go`:

```go
// Repositories
userRepo := repositories.NewUserRepository(db)

// Services
authService := services.NewAuthService(userRepo, cfg.JWT.Secret)

// Controllers
authController := controllers.NewAuthController(authService)

// Router
e := router.InitRouter(cfg, authController)
```

Cuando agregues un nuevo recurso (ej: cases), seguís el mismo patrón:
`repository → service → controller → registrar en router → registrar en main`.
