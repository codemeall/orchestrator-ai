#!/usr/bin/env sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SOURCE="$SCRIPT_DIR/skills/orchestrate-agents"
CONFIG_DIR=${CLAUDE_CONFIG_DIR:-"$HOME/.claude"}
SKILLS_DIR="$CONFIG_DIR/skills"
TARGET="$SKILLS_DIR/orchestrate-agents"

if [ ! -f "$SOURCE/SKILL.md" ]; then
  echo "Error: $SOURCE/SKILL.md was not found." >&2
  echo "Run this installer from a complete clone of the repository." >&2
  exit 1
fi

mkdir -p "$SKILLS_DIR"

if [ -L "$TARGET" ]; then
  CURRENT_TARGET=$(readlink "$TARGET")
  RESOLVED_TARGET=$(CDPATH= cd -- "$TARGET" 2>/dev/null && pwd -P || true)
  RESOLVED_SOURCE=$(CDPATH= cd -- "$SOURCE" && pwd -P)
  if [ -n "$RESOLVED_TARGET" ] && [ "$RESOLVED_TARGET" = "$RESOLVED_SOURCE" ]; then
    echo "Orchestrate Agents is already installed at $TARGET"
    exit 0
  fi

  echo "Error: $TARGET is already a symbolic link to $CURRENT_TARGET" >&2
  echo "Remove or rename it deliberately before installing." >&2
  exit 1
fi

if [ -e "$TARGET" ]; then
  echo "Error: $TARGET already exists and will not be overwritten." >&2
  echo "Remove or rename it deliberately before installing." >&2
  exit 1
fi

ln -s "$SOURCE" "$TARGET"

echo "Installed Orchestrate Agents at $TARGET"
echo "Open Claude Code, run /skills, and search for orchestrate-agents."
