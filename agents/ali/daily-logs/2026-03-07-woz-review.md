# Resumen Ejecutivo — Review de commits de Woz
**Fecha:** 2026-03-07  
**Rango:** desde merge de `feature/sise-consultas-client` (commit `493e126`) hasta HEAD en `main`  
**Commits analizados:** 12 commits (10 en el PR + 2 fixups post-merge)

---

## TL;DR

Woz entregó la integración completa con SISE para siniestros: un cliente Go que consulta la API de SISE con 3 queries registradas (Claim, Policy, Producer), un orquestador de tokens con cache Redis, un stack completo de backend (modelo → migrations → repositorio → servicio → controller → rutas), y un nuevo tab "Siniestros" en el webapp con modal de búsqueda + lista.

---

## 1. Archivos nuevos/modificados

### Backend (`backend/`)

**Nuevos:**
| Archivo | Descripción |
|---|---|
| `internal/services/sise/sise_consultas_client.go` | Cliente HTTP para SISE — 3 métodos de dominio (GetClaimByNumber, GetPolicySummary, GetProducerByCode) + todos los DTOs crudos |
| `internal/services/sise/sise_consultas_orchestrator.go` | Orquestador de token con Redis cache + retry-on-401 automático |
| `internal/services/cache/redis.go` | Conexión singleton a Redis (go-redis/v9) |
| `internal/services/cache/sise_cache.go` | SetSISEToken / GetSISEToken / DeleteSISEToken — clave `sise:token` con TTL real − 60s buffer |
| `internal/controllers/claim_controller.go` | 3 handlers: List, Lookup, Create |
| `internal/services/claim_service.go` | ClaimService interface con List / Lookup / Create; Lookup hace 3 llamadas en cadena a SISE |
| `internal/repositories/claim_repository.go` | CRUD en Postgres: List / Create / ExistsBySISEClaimID / FindBySISEClaimID |
| `internal/models/claim.go` | Modelo Claim (30+ campos, refleja tabla claims) |
| `internal/dto/claim.go` | ClaimResponse + ClaimLookupResponse + ToClaimResponse mapper |
| `migrations/007_create_claims_table.sql` | Tabla `claims` (ver sección 3) |
| `migrations/008_add_claim_id_to_cases.sql` | FK `claim_id UUID NULL REFERENCES claims(id)` en `cases` |
| `docs/docs.go`, `swagger.json`, `swagger.yaml` | Swagger generado — 491 líneas nuevas |

**Modificados:**
| Archivo | Cambio |
|---|---|
| `cmd/server/main.go` | Wire Redis + SISE client/orchestrator + claimRepo + claimService + claimController |
| `internal/config/config.go` | Agrega RedisConfig (`REDIS_URL`) y SISEConfig (`SISE_BASE_URL`, `SISE_USERNAME`, `SISE_PASSWORD`) |
| `internal/router/router.go` | 3 rutas nuevas bajo `/api/v1` (JWT-protected) |
| `internal/models/case.go` | Campo `ClaimID *uuid.UUID` nullable |
| `.env.example` | Variables REDIS_URL + SISE_* documentadas |
| `docker-compose.yml` | Servicio Redis agregado |
| `go.mod` / `go.sum` | go-redis/v9 + swaggo |

### Webapp (`clients/web/`)

**Nuevos:**
| Archivo | Descripción |
|---|---|
| `src/pages/Claims.tsx` | Página completa (~270 líneas): lista de siniestros + modal AddClaim |
| `src/api/schemas/claim.schemas.ts` | Schemas Zod: ClaimSchema (nuestro DB), SISEClaimSchema, SISEPolicySchema, SISEProducerSchema, ClaimLookupResponseSchema |
| `src/api/services/claim.service.ts` | claimService con list / lookup / create + claimKeys para React Query |
| `src/api/hooks/useClaims.ts` | useClaims, useClaimLookup (enabled con nroStro ≥ 3 chars), useCreateClaim |

**Modificados:**
| Archivo | Cambio |
|---|---|
| `src/App.tsx` | Ruta `/claims` → `<ClaimsPage>` |
| `src/components/Layout.tsx` | Link "Siniestros" en la nav sidebar |

---

## 2. Endpoints nuevos

Todos bajo `/api/v1`, autenticados con JWT (Bearer token del usuario web):

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/v1/claims` | Lista todos los siniestros persistidos en nuestra DB, ordenados por `created_at DESC` |
| `GET` | `/api/v1/claims/lookup?nro_stro=<N>` | Consulta SISE en tiempo real: devuelve claim + policy + producer SIN persistir |
| `POST` | `/api/v1/claims` | Body: `{"nro_stro": "..."}` — Busca en SISE y persiste. Idempotente por `sise_claim_id`. Si ya existe, retorna el existente. |

---

## 3. Migrations

### 007 — `create_claims_table`
Tabla `claims` con ~30 columnas:
- **SISE IDs:** `sise_claim_id BIGINT UNIQUE` (id_stro), `sise_id_pv BIGINT`, `claim_number BIGINT`, `claim_subnumber`, `policy_number`, `policy_endorsement`, `ramo_code`
- **Datos del siniestro:** `incident_date`, `registration_date`, `notice_date`, `payment_date NULL`, `cause`, `coverage`, `status VARCHAR(50)`, `estimated_amount NUMERIC(15,2)`, `paid_amount NUMERIC(15,2)`
- **Asegurado:** `contratante VARCHAR(200)`, `doc_type`, `doc_number`
- **Datos de póliza** (del PolicySummary): `policy_type`, `insured_amount NUMERIC(15,6)`, `policy_valid_from/to`, `commercial_product_code`, `commercial_product`
- **Productor** (del Producer): `producer_code INT`, `producer_type_code/group_code SMALLINT`, `producer_status VARCHAR(5)`, `producer_name`, `producer_type`
- **Índices:** UNIQUE en `sise_claim_id`, índices en `claim_number`, `policy_number`, `status`, `doc_number`, `producer_code`

### 008 — `add_claim_id_to_cases`
```sql
ALTER TABLE cases ADD COLUMN IF NOT EXISTS claim_id UUID NULL REFERENCES claims(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_cases_claim_id ON cases(claim_id);
```
Conecta casos con siniestros — la FK está ahí pero la lógica de linkeo no está implementada todavía (campo queda NULL por ahora).

---

## 4. Integración con SISE — Redis cache + Token Orchestrator

### Arquitectura de autenticación

```
ConsultasOrchestrator
    ↓ getToken()
    ├── cache.GetSISEToken() → Redis GET "sise:token"
    │       hit  → return token string
    │       miss → refreshToken()
    │                   ↓
    │              ConsultasClient.GetToken()
    │              POST /token (OAuth2 password grant)
    │                   ↓
    │              cache.SetSISEToken(token, expiresIn)
    │              Redis SET "sise:token" TTL=(expiresIn − 60s)
    │
    └── En caso de error en llamada SISE:
            DeleteSISEToken() → Redis DEL "sise:token"
            refreshToken() → reintento único
```

### Detalles técnicos
- **TTL buffer:** se le restan 60 segundos al `expires_in` de SISE para evitar usar tokens a punto de expirar
- **Retry pattern:** ante cualquier error en una query SISE, el orquestador invalida el cache y reintenta UNA sola vez con token fresco
- **3 Query IDs hardcodeados** (UUIDs registrados en SISE):
  - `3618d606-...` → GetClaimByNumber (params: `codigo_usuario` + `nro_stro`)
  - `8432bf12-...` → GetPolicySummary (param: `id_pv` int)
  - `097a813a-...` → GetProducerByCode (filter: `cod_agente` equal int32)
- **Endpoint SISE:** `https://sise-consultas.libraseguros.com.ar/Sise3GBELibraCoreprodConsultas`
- **Errores de typo en SISE documentados:** `fecha_resgistro` (sic), `Codido_Asegurado` (sic) — mapeados tal cual

### Flujo de Lookup (3 llamadas en cadena)
```
GET /api/v1/claims/lookup?nro_stro=X
    ↓
claimService.Lookup(X)
    ↓
    1. GetClaimByNumber(X)   → Claim { IDStro, IDPV, NroSiniestro, ... }
    2. GetPolicySummary(IDPV) → PolicySummary { CodigoProductor, ... }
    3. GetProducerByCode(CodigoProductor) → Producer { nombre, tipo_agente, ... }
    ↓
ClaimLookupResponse { claim, policy, producer }
```

---

## 5. Cambios en el webapp

### Claims Page (`/claims`)
- **Header** con botón "Agregar siniestro" → abre modal
- **Tabla** de siniestros persistidos con columnas: Nro. siniestro / Causa + Cobertura / Contratante / Fecha hecho / Estado / Registrado
  - Status badge: verde "ABIERTO", gris para cerrados
  - `formatTableTime()` para la columna "Registrado"
  - Empty state con CTA para agregar el primero
- **Post-merge fixes:** se removió la col `estimated_amount` de la tabla, se ajustó el `pl-4` del primer header

### AddClaim Modal (Lookup Modal)
- **Búsqueda:** input de nro_stro → botón Buscar → `useClaimLookup` (enabled cuando `nroStro ≥ 3`)
- **Preview en 3 secciones colapsadas:** Siniestro / Póliza / Productor con rows label-value
- **Footer:** Cancelar + "Confirmar y guardar" → `useCreateClaim` → invalida query list
- **Estados manejados:** loading ("Consultando SISE..."), error (AlertCircle), datos (LookupPreview)
- El modal es destructivo en el sentido que al cambiar el input se resetea `confirmed = false` y cancela la query pendiente

---

## 6. Impacto en arquitectura del pipeline de agentes

### Directo

1. **Nueva tabla `claims`** — Los agentes que operan sobre `cases` ahora pueden linkear un caso a un siniestro SISE via `claim_id`. Esto abre la puerta a que el pipeline de triage use datos reales de SISE (estado del siniestro, montos, vigencia de póliza) en el razonamiento.

2. **Redis ya está en producción** — La cache de token SISE usa Redis. Esto significa que el stack ahora depende de Redis correctamente. Los agentes podrían usar Redis para otros propósitos (sesiones, rate limiting, cache de contexto) sin infraestructura adicional.

3. **SISE como fuente de verdad** — Woz no creó un endpoint de "fetch desde SISE para el pipeline"; los agentes tendrían que llamar al endpoint `/api/v1/claims/lookup` (con JWT de usuario) o necesitarían acceso directo al `ConsultasOrchestrator`. Actualmente no hay endpoint agent-key para claims.

### Potencial (no implementado aún)

- `claim_id` en `cases` está NULL para todos los casos existentes. La lógica de "asociar automáticamente un siniestro entrante a su caso" no existe — habría que buildearla.
- El orquestador SISE es inyectable — podría usarse directamente desde un skill de agente si se agrega como dependency al pipeline, sin pasar por HTTP.
- Los 3 query IDs hardcodeados son los únicos soportados. Si el pipeline necesita otras consultas a SISE (ej: historial de siniestros por DNI), habría que agregar nuevos query IDs.

### Nuevo env vars requeridos
```
REDIS_URL=redis://localhost:6379
SISE_BASE_URL=https://sise-consultas.libraseguros.com.ar/Sise3GBELibraCoreprodConsultas
SISE_USERNAME=<usuario>
SISE_PASSWORD=<password>
```

---

## Commits por orden cronológico (del PR)

| Hash | Mensaje |
|---|---|
| `cdd7810` | feat: sise-consultas-client — Redis cache, token orchestrator, GetSiniestroByNumber stub |
| `204ff4b` | feat: complete sise-consultas — real query params, Redis wired in main.go |
| `352a8da` | feat: real Siniestro schema from SISE response |
| `4e685a6` | feat: GetPolicySummary — query 8432bf12, real schema, orchestrator wired |
| `36cb152` | feat: GetProductorByCodigo — query 097a813a, filter by cod_agente |
| `d64f71b` | refactor: English naming — Claim, Producer, GetClaimByNumber, GetProducerByCode |
| `38e5076` | feat: claims model — migrations 007+008, Claim model, claim_id on cases |
| `2bf2289` | feat: claims endpoints — lookup (SISE) + create (persist), full service/repo/controller stack |
| `598e34c` | feat: siniestros tab — Claims page, lookup modal, list, service/hooks/schemas |
| `af5f5d2` | Merge PR #11 |
| `628b408` | fix: claims table — remove estimated_amount col, use formatTableTime for registrado |
| `7343fe2` | fix: claims table — add pl-4 to first column header and row |

---

*Generado por Ali subagent — 2026-03-07*
