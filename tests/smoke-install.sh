#!/usr/bin/env sh

set -eu

ROOT=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

export CLAUDE_CONFIG_DIR="$TMP/claude-config"
mkdir -p "$CLAUDE_CONFIG_DIR"

"$ROOT/install.sh" >"$TMP/install-1.txt"
TARGET="$CLAUDE_CONFIG_DIR/skills/orchestrate-agents"

test -L "$TARGET"
test -f "$TARGET/SKILL.md"
test "$(readlink "$TARGET")" = "$ROOT/skills/orchestrate-agents"

"$ROOT/install.sh" >"$TMP/install-2.txt"
grep -q "already installed" "$TMP/install-2.txt"

echo "Unix installer smoke test passed."
