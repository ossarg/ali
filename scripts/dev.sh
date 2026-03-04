#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[dev]${NC} $1"; }
warn() { echo -e "${YELLOW}[dev]${NC} $1"; }
err()  { echo -e "${RED}[dev]${NC} $1"; }

# Cleanup on exit
cleanup() {
  echo ""
  warn "Shutting down..."
  docker compose -f "$ROOT/docker-compose.yml" down
  exit 0
}
trap cleanup SIGINT SIGTERM

# 1. Check dependencies
for cmd in docker npm; do
  if ! command -v $cmd &>/dev/null; then
    err "Missing dependency: $cmd"
    exit 1
  fi
done

if [ ! -f "$ROOT/backend/.env" ]; then
  warn "backend/.env not found — copying from .env.example"
  cp "$ROOT/backend/.env.example" "$ROOT/backend/.env"
fi

if [ ! -f "$ROOT/clients/web/.env" ]; then
  warn "clients/web/.env not found — copying from .env.example"
  cp "$ROOT/clients/web/.env.example" "$ROOT/clients/web/.env"
fi

# 2. Start infrastructure
log "Starting postgres + backend..."
docker compose -f "$ROOT/docker-compose.yml" up --build -d

# 3. Wait for backend health
log "Waiting for backend to be ready..."
MAX_WAIT=60
WAITED=0
until curl -sf http://localhost:8080/health > /dev/null 2>&1; do
  if [ $WAITED -ge $MAX_WAIT ]; then
    err "Backend did not start in ${MAX_WAIT}s"
    docker compose -f "$ROOT/docker-compose.yml" logs backend
    exit 1
  fi
  sleep 2
  WAITED=$((WAITED + 2))
done
log "Backend ready ✓"

# 4. Run migrations
log "Running migrations..."
DATABASE_URL=postgresql://libra:libra@localhost:5432/libra_legal \
  bash "$ROOT/backend/scripts/migrate.sh"
log "Migrations done ✓"

# 5. Install frontend deps if needed
if [ ! -d "$ROOT/clients/web/node_modules" ]; then
  log "Installing frontend dependencies..."
  npm --prefix "$ROOT/clients/web" install
fi

# 6. Start frontend
log "Starting frontend on http://localhost:3000"
log "Backend API on http://localhost:8080"
log "Swagger on http://localhost:8080/swagger/index.html"
echo ""
npm --prefix "$ROOT/clients/web" run dev
