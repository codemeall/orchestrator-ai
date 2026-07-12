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

Cursor can provide the same provider-diversity role without changing the profile defaults:

```text
/orchestrate-agents quality agents=codex-terra,cursor:grok-4.5-xhigh -- implement the retry fix and get a cross-provider adversarial review
```

The Cursor reviewer uses `cursor:adversarial-review`. Cursor model IDs have no `@effort` suffix; `grok-4.5-xhigh` already includes its effort variant. This differs from the `grok` alias, which routes through the xAI Grok Build CLI.
