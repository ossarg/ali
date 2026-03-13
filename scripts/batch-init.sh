#!/usr/bin/env bash
# batch-init.sh — Inicializa batch-state.json a partir de una carpeta de PDFs
# Uso: ./scripts/batch-init.sh /path/to/pdfs/folder
# Produce: pipeline-tests/batch/batch-state.json con todos los casos en estado "pending"

set -euo pipefail

PDF_DIR="${1:-}"
STATE_FILE="$(dirname "$0")/../pipeline-tests/batch/batch-state.json"
OUTPUT_BASE="$(dirname "$0")/../pipeline-tests"
BACKEND_URL="http://localhost:8080"
CONCURRENCY=3

if [[ -z "$PDF_DIR" ]]; then
  echo "ERROR: Uso: $0 /path/to/pdfs/folder" >&2
  exit 1
fi

if [[ ! -d "$PDF_DIR" ]]; then
  echo "ERROR: directorio no existe: $PDF_DIR" >&2
  exit 1
fi

NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Build cases array from PDFs found
CASES="["
FIRST=1
COUNT=0

for pdf in "$PDF_DIR"/*.pdf; do
  [[ -f "$pdf" ]] || continue
  CASE_ID=$(basename "$pdf" .pdf | tr ' ' '_' | tr '[:upper:]' '[:lower:]')
  CASE_OUTPUT_DIR="$OUTPUT_BASE/$CASE_ID"
  mkdir -p "$CASE_OUTPUT_DIR"
  [[ $FIRST -eq 0 ]] && CASES+=","
  CASES+="{\"id\":\"$CASE_ID\",\"pdf_path\":\"$pdf\",\"output_dir\":\"$CASE_OUTPUT_DIR\",\"status\":\"pending\",\"current_step\":null,\"steps\":{\"donna\":null,\"mike\":null,\"edu\":null,\"jess\":null,\"lou\":null},\"started_at\":null,\"completed_at\":null,\"error\":null}"
  FIRST=0
  COUNT=$((COUNT + 1))
done

CASES+="]"

python3 - <<PYEOF
import json

state = {
  "version": 1,
  "config": {
    "concurrency": $CONCURRENCY,
    "pdf_base_path": "$PDF_DIR",
    "output_base_path": "$OUTPUT_BASE",
    "backend_url": "$BACKEND_URL"
  },
  "stats": {
    "total": $COUNT,
    "pending": $COUNT,
    "running": 0,
    "completed": 0,
    "failed": 0,
    "started_at": None,
    "updated_at": "$NOW"
  },
  "cases": $CASES
}

with open("$STATE_FILE", "w") as f:
    json.dump(state, f, indent=2)

print(f"Initialized {$COUNT} cases in $STATE_FILE")
PYEOF
