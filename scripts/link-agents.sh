#!/usr/bin/env bash
# link-agents.sh — Linkea cada agente en agents/ a su ~/.openclaw/workspace
# Uso: ./link-agents.sh [nombre-agente]  (sin argumento: linkea todos)
set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AGENTS_DIR="$REPO_DIR/agents"
TARGET_AGENT="${1:-}"

link_agent() {
  local agent_name="$1"
  local agent_src="$AGENTS_DIR/$agent_name"
  local workspace="$HOME/.openclaw/workspace"

  echo "🔗 Linkeando agente: $agent_name → $workspace"

  mkdir -p "$workspace"

  for file in "$agent_src"/*.md; do
    [ -f "$file" ] || continue
    filename="$(basename "$file")"
    target="$workspace/$filename"

    # Backup si ya existe y no es symlink
    if [ -f "$target" ] && [ ! -L "$target" ]; then
      echo "   ⚠️  Backup: $filename → $filename.bak"
      mv "$target" "$target.bak"
    fi

    ln -sf "$file" "$target"
    echo "   ✅ $filename"
  done
}

if [ -n "$TARGET_AGENT" ]; then
  link_agent "$TARGET_AGENT"
else
  for agent_dir in "$AGENTS_DIR"/*/; do
    agent_name="$(basename "$agent_dir")"
    link_agent "$agent_name"
  done
fi

echo ""
echo "✅ Agentes linkeados."
