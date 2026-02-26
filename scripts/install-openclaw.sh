#!/usr/bin/env bash
# install-openclaw.sh — Instala o actualiza OpenClaw
set -e

echo "📦 Instalando OpenClaw..."

if command -v openclaw &>/dev/null; then
  CURRENT=$(openclaw --version 2>/dev/null || echo "desconocida")
  echo "   OpenClaw ya instalado (versión: $CURRENT). Actualizando..."
fi

curl -fsSL https://openclaw.ai/install.sh | bash

echo "✅ OpenClaw instalado."
