# Release candidate verification log

Date: 2026-07-10
Candidate version: 1.0.0
Status: prepared locally; public tag/release awaiting explicit go-live approval

## Automated checks run locally

| Check | Outcome |
|---|---|
| `npm test` (skill validate + consistency) | passed |
| `./tests/smoke-install.sh` | passed |
| `scripts/validate-skill.mjs` | passed |
| Upstream `agentskills validate` | fails on Claude extensions `argument-hint` and `disable-model-invocation` (expected; local validator allows them) |
| ShellCheck | not installed on this machine; covered in CI |
| Windows installer smoke | covered in CI `windows-install` job |
| Markdown link check | covered in CI with known badge/advisory exclusions until first remote workflow run |

## Manual provider matrix

Run these in disposable repositories before tagging. Record host/plugin versions.

| Scenario | Host / plugin versions | Result | Notes |
|---|---|---|---|
| Native Haiku economy lookup | pending | pending | Claude-only path |
| Codex write via rescue | pending | pending | Requires codex-plugin-cc |
| Codex read-only review | pending | pending | Use `/codex:review` |
| Grok read-only review | pending | pending | Use review/adversarial-review |
| Grok write rescue | pending | pending | Confirm writer-slot consumption |
| Explicit model selection | pending | pending | Codex and Grok full specs |
| `fallback=auto` | pending | pending | Alias substitution |
| `fallback=ask` | pending | pending | Full model ID default |
| `fallback=none` | pending | pending | Hard stop on unavailable model |

## Go-live blockers remaining

1. Complete the manual provider matrix above.
2. Push the release-candidate commit and confirm GitHub Actions is green.
3. Obtain explicit approval to tag `v1.0.0` and create the GitHub Release.
4. Set repository description/topics after the release commit is on `main`.

## Prepared launch metadata

- Description: Cost-aware multi-agent orchestration skill for Claude Code, Codex, and Grok
- Topics: `agent-skills`, `claude-code`, `codex`, `grok`, `multi-agent`, `orchestration`
- Install command: `npx skills add codemeall/orchestrator-ai --skill orchestrate-agents -g -y`
