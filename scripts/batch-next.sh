#!/usr/bin/env bash
# batch-next.sh — Devuelve el próximo case_id listo para correr (todos sus blocked_by están en "ok")
# Uso: ./scripts/batch-next.sh
# Output: case_id o vacío si no hay nada listo

STATE_FILE="$(dirname "$0")/../pipeline-tests/batch/batch-state.json"

python3 - <<PYEOF
import json, sys

with open("$STATE_FILE") as f:
    state = json.load(f)

running = sum(1 for c in state["cases"] if c["status"] == "running")
max_concurrency = state["config"]["concurrency"]

if running >= max_concurrency:
    sys.exit(0)

for case in state["cases"]:
    if case["status"] != "pending":
        continue

    # Find next step that is unblocked
    steps = case["steps"]
    for step_name, step_data in steps.items():
        if not isinstance(step_data, dict):
            continue
        if step_data.get("status") not in (None, "pending"):
            continue
        # Check all blockers are "ok"
        blocked_by = step_data.get("blocked_by", [])
        all_unblocked = all(
            steps.get(dep, {}).get("status") == "ok"
            for dep in blocked_by
        )
        if all_unblocked:
            print(f"{case['id']}\t{step_name}")
            sys.exit(0)

PYEOF
