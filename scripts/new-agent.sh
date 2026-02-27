#!/usr/bin/env bash
# new-agent.sh — Crea un nuevo agente interactivamente
set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AGENTS_DIR="$REPO_DIR/agents"
OPENCLAW_CONFIG="$HOME/.openclaw/openclaw.json"

echo "🤖 Nuevo agente — Ali Project"
echo "=============================="
echo ""

# --- Nombre del agente ---
read -rp "Nombre del agente (sin espacios, ej: pepe): " AGENT_NAME
AGENT_NAME=$(echo "$AGENT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

if [ -z "$AGENT_NAME" ]; then
  echo "❌ El nombre no puede estar vacío."
  exit 1
fi

if [ -d "$AGENTS_DIR/$AGENT_NAME" ]; then
  echo "❌ Ya existe un agente llamado '$AGENT_NAME'."
  exit 1
fi

# --- Nombre display ---
read -rp "Nombre para mostrar (ej: Pepe): " DISPLAY_NAME
DISPLAY_NAME="${DISPLAY_NAME:-$AGENT_NAME}"

# --- Rol / descripción ---
read -rp "Rol del agente (ej: Asistente de RRHH): " AGENT_ROLE
AGENT_ROLE="${AGENT_ROLE:-Asistente de IA}"

# --- Modelo ---
echo ""
echo "Modelos disponibles:"
echo "  1) anthropic/claude-sonnet-4-6  (default, recomendado)"
echo "  2) anthropic/claude-haiku-4-5   (más rápido, más barato)"
echo "  3) Otro (ingresar manualmente)"
read -rp "Modelo [1]: " MODEL_CHOICE
case "$MODEL_CHOICE" in
  2) MODEL="anthropic/claude-haiku-4-5" ;;
  3) read -rp "Modelo: " MODEL ;;
  *) MODEL="anthropic/claude-sonnet-4-6" ;;
esac

# --- Canal Discord ---
echo ""
read -rp "Canal de Discord para este agente (ej: pepe): " DISCORD_CHANNEL
DISCORD_CHANNEL="${DISCORD_CHANNEL:-$AGENT_NAME}"

# --- Confirmación ---
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Agente:  $AGENT_NAME"
echo "  Display: $DISPLAY_NAME"
echo "  Rol:     $AGENT_ROLE"
echo "  Modelo:  $MODEL"
echo "  Canal:   #$DISCORD_CHANNEL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -rp "¿Confirmar? [S/n]: " CONFIRM
[[ "$CONFIRM" =~ ^[Nn] ]] && echo "Cancelado." && exit 0

# --- Crear archivos del agente ---
echo ""
echo "📁 Creando agents/$AGENT_NAME/..."
mkdir -p "$AGENTS_DIR/$AGENT_NAME"

cat > "$AGENTS_DIR/$AGENT_NAME/IDENTITY.md" <<EOF
# IDENTITY.md - Who Am I

- **Name:** $DISPLAY_NAME
- **Creature:** $AGENT_ROLE
- **Vibe:** Cálido, experto, directo
- **Emoji:** 🤖

---

_Actualizar con más detalles del agente._
EOF

cat > "$AGENTS_DIR/$AGENT_NAME/SOUL.md" <<EOF
# SOUL.md - Who You Are

_You're not a chatbot. You're becoming someone._

## Core Truths

**Be genuinely helpful, not performatively helpful.** Skip the filler words — just help.

**Have opinions.** You're allowed to disagree, prefer things, find stuff amusing or boring.

**Be resourceful before asking.** Try to figure it out first. Then ask if you're stuck.

**Earn trust through competence.** Be careful with external actions, bold with internal ones.

## Vibe

Concise when needed, thorough when it matters. Not a corporate drone. Not a sycophant. Just good.
EOF

cat > "$AGENTS_DIR/$AGENT_NAME/AGENTS.md" <<EOF
# AGENTS.md - $DISPLAY_NAME Workspace

## Every Session

1. Read \`SOUL.md\` — this is who you are
2. Read \`IDENTITY.md\` — your role
3. Read \`USER.md\` — who you're helping

## Behavior

- Respond when directly addressed or when you can add genuine value
- In group chats, don't respond to every message — quality over quantity
- Use reactions naturally on Discord
EOF

cat > "$AGENTS_DIR/$AGENT_NAME/USER.md" <<EOF
# USER.md - About Your Human

- **Name:** 
- **Timezone:** America/Buenos_Aires
- **Notes:** 

## Context

_Actualizar con información del equipo y proyectos._
EOF

cat > "$AGENTS_DIR/$AGENT_NAME/TOOLS.md" <<EOF
# TOOLS.md - Local Notes

_Agregar aquí configs específicas: cámaras, SSH, TTS, etc._
EOF

cat > "$AGENTS_DIR/$AGENT_NAME/HEARTBEAT.md" <<EOF
# HEARTBEAT.md

# Keep this file empty (or with only comments) to skip heartbeat API calls.
EOF

echo "✅ Archivos creados."

# --- Linkear agente ---
echo ""
echo "🔗 Linkeando agente..."
bash "$REPO_DIR/scripts/link-agents.sh" "$AGENT_NAME"

# --- Actualizar openclaw.json ---
echo ""
echo "⚙️  Actualizando openclaw.json..."

# Usar python para editar el JSON sin romperlo
python3 - <<PYEOF
import json, sys

config_path = "$OPENCLAW_CONFIG"
with open(config_path) as f:
    config = json.load(f)

# Asegurar que exista la estructura de agentes
if "agents" not in config:
    config["agents"] = {}
if "named" not in config["agents"]:
    config["agents"]["named"] = {}

# Agregar config del nuevo agente
config["agents"]["named"]["$AGENT_NAME"] = {
    "model": {
        "primary": "$MODEL"
    },
    "workspace": "$HOME/.openclaw/agents/$AGENT_NAME/workspace"
}

# Agregar canal Discord (guild principal)
guilds = config.get("channels", {}).get("discord", {}).get("guilds", {})
for guild_id, guild_config in guilds.items():
    if "channels" not in guild_config:
        guild_config["channels"] = {}
    guild_config["channels"]["$DISCORD_CHANNEL"] = {"allow": True}

with open(config_path, "w") as f:
    json.dump(config, f, indent=4)

print("   ✅ openclaw.json actualizado.")
PYEOF

# --- Resumen final ---
echo ""
echo "✅ Agente '$DISPLAY_NAME' creado exitosamente."
echo ""
echo "Próximos pasos:"
echo "  1. Creá el canal #$DISCORD_CHANNEL en Discord"
echo "  2. Reiniciá OpenClaw: openclaw gateway restart"
echo "  3. Editá agents/$AGENT_NAME/IDENTITY.md y SOUL.md con más detalle"
echo "  4. Commiteá: git add agents/$AGENT_NAME && git commit -m 'feat: agente $AGENT_NAME'"
