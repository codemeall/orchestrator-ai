# Balanced profile example

Invocation:

```text
/orchestrate-agents balanced agents=codex-terra,sonnet -- implement refresh-token rotation and verify the security boundaries
```

Expected routing:

- Profile: `balanced` (max 2 workers)
- Writer: `codex-terra` via `codex:rescue`
- Reviewer: `sonnet` after the write completes
- Contract: full handoff for both workers
- Single-writer: Codex holds the checkout; Sonnet stays read-only

Expected finish shape:

- Outcome
- Agents actually used
- Changed files and verification
- Remaining risks or required decisions
