#!/usr/bin/env bash
# setup.sh — Bootstrap completo: OpenClaw + todos los agentes
set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🦞 Ali Project — Setup completo"
echo "================================"
echo ""

# 1. Instalar OpenClaw
bash "$REPO_DIR/scripts/install-openclaw.sh"

# 2. Linkear todos los agentes
bash "$REPO_DIR/scripts/link-agents.sh"

echo ""
echo "✅ Setup completo. Verificá con: openclaw doctor"
