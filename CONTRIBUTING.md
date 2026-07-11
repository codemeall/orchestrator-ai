# Contributing

Thanks for helping improve Orchestrate Agents.

## Before you change behavior

- Keep orchestration rules in [`skills/orchestrate-agents/SKILL.md`](skills/orchestrate-agents/SKILL.md).
- Keep model aliases, profile defaults, and fallback order in [`skills/orchestrate-agents/references/routing-policy.md`](skills/orchestrate-agents/references/routing-policy.md).
- Update [`README.md`](README.md) when user-facing syntax, install steps, or provider semantics change.
- Add or update fixtures in [`tests/`](tests/) for routing, contract, or documentation invariants.
- Record user-visible changes in [`CHANGELOG.md`](CHANGELOG.md).

## Local checks

```sh
npm test
npm run validate:skill
./tests/smoke-install.sh
```

On Windows PowerShell:

```powershell
npm test
powershell -ExecutionPolicy Bypass -File .\tests\smoke-install.ps1
```

## Design rules

- Prefer the cheapest capable worker.
- Preserve the single-writer rule.
- Do not silently replace explicitly requested models.
- Keep worker handoffs compact and evidence-backed.
- Do not expand scope into unrelated refactors.

## Pull requests

1. Describe the user-visible behavior change.
2. Note any provider plugin version assumptions.
3. Include test output for the checks above.
4. Keep commits focused and reviewable.
