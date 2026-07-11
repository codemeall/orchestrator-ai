# Economy profile example

Invocation:

```text
/orchestrate-agents economy -- what React version does frontend/ use?
```

Expected routing:

- Profile: `economy` (max 1 worker)
- Worker: `haiku` / `claude-haiku-4-5`
- Mode: read-only
- Contract: compact handoff with STATUS, SUMMARY, EVIDENCE, optional VERIFICATION
- Coordinator: no broad pre-dispatch inventory; lean prompt with question + scope + contract

Expected finish shape:

- Pass through SUMMARY and EVIDENCE
- Report actual worker used
- Spot-check EVIDENCE as verified or not verified
- Do not rewrite findings
