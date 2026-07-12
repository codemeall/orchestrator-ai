# Consistency fixtures for orchestrate-agents

These fixtures encode expected routing and documentation invariants.
They are checked by `tests/check-consistency.mjs`.

## Invocations

### economy-readonly
- invocation: `/orchestrate-agents economy -- investigate React version in frontend/`
- profile: economy
- maxWorkers: 1
- expectedWorkers: [haiku]
- writeMode: read-only
- contract: compact
- requirePolicyRead: true

### balanced-implement-review
- invocation: `/orchestrate-agents balanced agents=codex-terra,sonnet -- implement and review refresh-token rotation`
- profile: balanced
- maxWorkers: 2
- expectedWorkers: [codex-terra, sonnet]
- writeMode: mixed
- contract: full
- requirePolicyRead: true

### quality-grok-effort
- invocation: `/orchestrate-agents quality agents=codex-terra,grok:grok-4.5@high -- implement and challenge failure modes`
- profile: quality
- maxWorkers: 3
- expectedWorkers: [codex-terra, grok]
- writeMode: mixed
- contract: full
- requirePolicyRead: false
- notes: grok full spec includes effort; codex-terra is an alias so policy read remains required because not every worker is a full specification

### quality-cursor-model
- invocation: `/orchestrate-agents quality agents=codex-terra,cursor:composer-2.5 -- implement and cross-provider review`
- profile: quality
- maxWorkers: 3
- expectedWorkers: [codex-terra, cursor]
- writeMode: mixed
- contract: full
- requirePolicyRead: true
- notes: Cursor full specs use `cursor:<model-id>` without an effort suffix; codex-terra is an alias so policy read remains required

### pinned-full-specs
- invocation: `/orchestrate-agents economy agents=claude:claude-haiku-4-5 -- summarize package scripts`
- profile: economy
- maxWorkers: 1
- expectedWorkers: [claude:claude-haiku-4-5]
- writeMode: read-only
- contract: compact
- requirePolicyRead: false

### profile-cap-truncation
- invocation: `/orchestrate-agents economy agents=codex-terra,sonnet -- investigate and review`
- profile: economy
- maxWorkers: 1
- expectedWorkers: [codex-terra]
- truncatedWorkers: [sonnet]
- writeMode: read-only-or-write depending on task
- contract: full if write, compact if trivial read-only
- requirePolicyRead: true
