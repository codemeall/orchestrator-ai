# Release candidate verification log

Date: 2026-07-16
Candidate version: 1.2.0
Status: prepared locally; public tag/release awaiting explicit go-live approval

## Automated checks run locally

| Check | Outcome |
|---|---|
| `npm test` (skill validate + consistency + routing fixtures) | passed (2026-07-16) |
| `./tests/smoke-install.sh` | passed (2026-07-16) |
| `scripts/validate-skill.mjs` | passed (2026-07-16); version pin replaced by semver check |
| Routing-fixture mutation test | passed (2026-07-16): reverting `requirePolicyRead` invariants makes `check-consistency.mjs` exit 1 |
| Upstream `agentskills validate` | fails on Claude extensions `argument-hint` and `disable-model-invocation` (expected; local validator allows them) |
| ShellCheck | not installed on this machine; covered in CI |
| Windows installer smoke | covered in CI `windows-install` job |
| Markdown link check | covered in CI with known badge/advisory exclusions until first remote workflow run |
| Plugin companion setup vs real CLIs | passed (2026-07-16): `grok-companion setup` OK against Grok Build CLI 0.2.99 (authenticated); `cursor-companion setup` OK against cursor-agent 2026.07.09 (authenticated). Note: this Cursor account exposes Composer 2.5 but **no Grok 4.5 models**, so the Cursor plugin `grok`/`grok-fast` aliases would fail here — reinforces the mandatory `cursor-agent --list-models` pre-dispatch validation in SKILL.md |
| Plugin exit-code + parser fixes | passed (2026-07-16): cursor-plugin-cc 29/29 tests, grok-plugin-cc 38/38 tests, incl. new exit-2-on-failure, `--` separator, effort-validation, and grok `--stdin-args` regression tests |

## Manual provider matrix

Run these in disposable repositories before tagging. Record host/plugin versions.

| Scenario | Host / plugin versions | Result | Notes |
|---|---|---|---|
| Native Haiku economy lookup | pending | pending | Claude-only path |
| Codex write via rescue | pending | pending | Requires codex-plugin-cc |
| Codex read-only review | pending | pending | Use `/codex:review` |
| Grok read-only review | pending | pending | Use review/adversarial-review; requires grok-plugin-cc 0.3.0+ |
| Grok write rescue | pending | pending | Confirm writer-slot consumption |
| Cursor read-only review | pending | pending | Use review/adversarial-review; requires cursor-plugin-cc 0.2.0+ |
| Cursor write rescue | pending | pending | Confirm writer-slot consumption |
| Explicit model selection | pending | pending | Codex, Grok, and Cursor full specs; no Cursor effort suffix |
| Codex alias model IDs | codex plugin 1.0.4 / codex-cli 0.144.1 inspected 2026-07-16 | pending live run | The plugin validates only `--effort` and aliases only `spark` → `gpt-5.3-codex-spark`; `gpt-5.6-luna/terra/sol` pass through unvalidated. The Codex CLI has no model-list command, so the routing-policy alias IDs can only be confirmed by a live dispatch. |
| Forced failure reporting | pending | pending | Dispatch with a bad model ID; confirm the coordinator reports failure (exit codes are not a success signal for plugin versions below the new minimums) |
| `fallback=auto` | pending | pending | Alias substitution |
| `fallback=ask` | pending | pending | Full model ID default |
| `fallback=none` | pending | pending | Hard stop on unavailable model |

## Go-live blockers remaining

1. Complete the manual provider matrix above (including the Codex alias live check).
2. Release `grok-plugin-cc` 0.3.0 and `cursor-plugin-cc` 0.2.0 so the new compatibility minimums are installable.
3. Push the release-candidate commit and confirm GitHub Actions is green.
4. Obtain explicit approval to tag `v1.2.0` and create the GitHub Release.
5. Set repository description/topics after the release commit is on `main`.

## Prepared launch metadata

- Description: Cost-aware multi-agent orchestration skill for Claude Code, Codex, Grok, and Cursor
- Topics: `agent-skills`, `claude-code`, `codex`, `grok`, `cursor`, `multi-agent`, `orchestration`
- Install command: `npx skills add codemeall/orchestrator-ai --skill orchestrate-agents -g -y`
