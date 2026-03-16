#!/usr/bin/env bash
# batch-step-update.sh — Ali llama esto después de completar cada step de un caso
# Uso: ./scripts/batch-step-update.sh <case_id> <step> <status> [error_message]
# step:   donna | mike | edu | jess | lou
# status: running | ok | failed
# Ejemplo: ./scripts/batch-step-update.sh garcia-c-ramoa donna ok

set -euo pipefail

CASE_ID="${1:-}"
STEP="${2:-}"
STATUS="${3:-}"
ERROR="${4:-}"
STATE_FILE="$(dirname "$0")/../pipeline-tests/batch/batch-state.json"

if [[ -z "$CASE_ID" || -z "$STEP" || -z "$STATUS" ]]; then
  echo "ERROR: Uso: $0 <case_id> <step> <status> [error]" >&2
  exit 1
fi

NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

python3 - <<PYEOF
import json, sys
from datetime import datetime, timezone

with open("$STATE_FILE") as f:
    state = json.load(f)

case = next((c for c in state["cases"] if c["id"] == "$CASE_ID"), None)
if not case:
    print(f"ERROR: case '$CASE_ID' not found", file=sys.stderr)
    sys.exit(1)

# Update step — support both old (string) and new (dict with blocked_by) format
steps = case["steps"]
step = steps.get("$STEP")
if isinstance(step, dict):
    step["status"] = "$STATUS"
else:
    steps["$STEP"] = {"status": "$STATUS", "blocked_by": []}

# Update case status
all_steps = ["donna", "mike", "edu", "jess", "lou"]
def get_step_status(s):
    v = steps.get(s)
    if isinstance(v, dict):
        return v.get("status")
    return v

done = all(get_step_status(s) == "ok" for s in all_steps)
any_failed = any(get_step_status(s) == "failed" for s in all_steps)

if "$STATUS" == "running" and case["status"] == "pending":
    case["status"] = "running"
    case["started_at"] = "$NOW"
    case["current_step"] = "$STEP"
elif "$STATUS" == "ok":
    case["current_step"] = "$STEP"
    if done:
        case["status"] = "completed"
        case["completed_at"] = "$NOW"
elif "$STATUS" == "failed":
    case["status"] = "failed"
    case["error"] = "$ERROR" if "$ERROR" else "failed at $STEP"
    case["completed_at"] = "$NOW"

# Recompute stats
state["stats"]["pending"] = sum(1 for c in state["cases"] if c["status"] == "pending")
state["stats"]["running"] = sum(1 for c in state["cases"] if c["status"] == "running")
state["stats"]["completed"] = sum(1 for c in state["cases"] if c["status"] == "completed")
state["stats"]["failed"] = sum(1 for c in state["cases"] if c["status"] == "failed")
state["stats"]["updated_at"] = "$NOW"

with open("$STATE_FILE", "w") as f:
    json.dump(state, f, indent=2)

print(f"Updated: $CASE_ID / $STEP = $STATUS")
PYEOF
