# Quality profile example

Invocation:

```text
/orchestrate-agents quality agents=codex-terra,grok:grok-4.5@high -- implement the retry fix and challenge its failure modes
```

Expected routing:

- Profile: `quality` (max 3 workers; 2 requested)
- Writer: `codex-terra` via `codex:rescue`
- Reviewer: Grok adversarial review with model `grok-4.5` and effort `high`
- Grok mode: `grok:adversarial-review` (read-only; does not consume writer slot)
- If Grok write rescue were used instead, it would consume the writer slot and must be serialized

Expected finish shape:

- Integrated outcome across implementer and adversarial reviewer
- Explicit models and efforts
- Verification evidence from the write path
- Distinct adversarial findings, not a restatement of the implementation summary
