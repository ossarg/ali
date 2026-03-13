#!/usr/bin/env bash
# batch-status.sh — Lee batch-state.json y muestra el estado actual del batch
# Uso: ./scripts/batch-status.sh

STATE_FILE="$(dirname "$0")/../pipeline-tests/batch/batch-state.json"

if [[ ! -f "$STATE_FILE" ]]; then
  echo "ERROR: batch-state.json no encontrado en $STATE_FILE" >&2
  exit 1
fi

python3 - <<PYEOF
import json, sys

with open("$STATE_FILE") as f:
    s = json.load(f)

st = s["stats"]
print(f"=== BATCH STATUS ===")
print(f"Total:     {st['total']}")
print(f"Pending:   {st['pending']}")
print(f"Running:   {st['running']}")
print(f"Completed: {st['completed']}")
print(f"Failed:    {st['failed']}")
print(f"Updated:   {st.get('updated_at', '-')}")
print()

for c in s["cases"]:
    steps = c["steps"]
    step_str = " | ".join(
        f"{k}={'✓' if v=='ok' else ('✗' if v=='failed' else ('→' if v=='running' else '·'))}"
        for k, v in steps.items()
    )
    status_icon = {"pending": "⏳", "running": "🔄", "completed": "✅", "failed": "❌"}.get(c["status"], "?")
    print(f"{status_icon} {c['id']:<40} [{step_str}]")
    if c.get("error"):
        print(f"   ERROR: {c['error']}")
PYEOF
