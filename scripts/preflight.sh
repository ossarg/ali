#!/usr/bin/env bash
# preflight.sh — Verifica que el entorno esté listo antes de iniciar el batch
# Uso: ./scripts/preflight.sh
# Exit 0 = todo OK | Exit 1 = hay problemas bloqueantes

set -uo pipefail

BACKEND_URL="http://localhost:8080"
ERRORS=0
WARNINGS=0

check() {
  local label="$1"
  local ok="$2"
  local msg="$3"
  if [[ "$ok" == "true" ]]; then
    echo "  ✓ $label"
  else
    echo "  ✗ $label — $msg"
    ERRORS=$((ERRORS + 1))
  fi
}

warn() {
  local label="$1"
  local msg="$2"
  echo "  ⚠ $label — $msg"
  WARNINGS=$((WARNINGS + 1))
}

echo "=== PRE-FLIGHT CHECK ==="
echo

echo "[ Backend ]"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" 2>/dev/null || echo "000")
check "Backend /health" "$([[ "$HTTP_CODE" == "200" ]] && echo true || echo false)" "HTTP $HTTP_CODE — backend no responde"

echo
echo "[ Docker ]"
DOCKER_UP=$(sudo docker compose -f /home/legales/.openclaw/workspace/ali/backend/docker-compose.yml ps --format json 2>/dev/null | python3 -c "import sys,json; data=sys.stdin.read(); services=[json.loads(l) for l in data.strip().split('\n') if l]; running=[s for s in services if s.get('State')=='running']; print(len(running))" 2>/dev/null || echo "0")
check "Docker services running" "$([[ "$DOCKER_UP" -ge 3 ]] && echo true || echo false)" "solo $DOCKER_UP servicios activos (esperado: 3)"

echo
echo "[ Sistema ]"
FREE_RAM=$(free -m | awk '/^Mem:/{print $7}')
check "RAM disponible ≥ 1500MB" "$([[ "$FREE_RAM" -ge 1500 ]] && echo true || echo false)" "${FREE_RAM}MB disponibles"
FREE_DISK=$(df /home/legales -m | awk 'NR==2{print $4}')
check "Disco disponible ≥ 2000MB" "$([[ "$FREE_DISK" -ge 2000 ]] && echo true || echo false)" "${FREE_DISK}MB disponibles"

echo
echo "[ Pipeline batch ]"
STATE_FILE="$(dirname "$0")/../pipeline-tests/batch/batch-state.json"
check "batch-state.json existe" "$([[ -f "$STATE_FILE" ]] && echo true || echo false)" "correr batch-init.sh primero"

if [[ -f "$STATE_FILE" ]]; then
  TOTAL=$(python3 -c "import json; d=json.load(open('$STATE_FILE')); print(d['stats']['total'])" 2>/dev/null || echo "0")
  check "Casos cargados en batch" "$([[ "$TOTAL" -gt 0 ]] && echo true || echo false)" "0 casos — correr batch-init.sh con el directorio de PDFs"
  [[ "$TOTAL" -gt 0 ]] && echo "    → $TOTAL casos listos para procesar"
fi

echo
echo "==============================="
if [[ "$ERRORS" -eq 0 ]]; then
  echo "✅ Pre-flight OK — listo para iniciar batch"
  [[ "$WARNINGS" -gt 0 ]] && echo "   ($WARNINGS advertencias — ver arriba)"
  exit 0
else
  echo "❌ $ERRORS error(es) bloqueantes — resolver antes de iniciar"
  exit 1
fi
