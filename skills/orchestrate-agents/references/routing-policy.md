# Routing Policy

Use aliases so routine invocations remain stable when provider model catalogs change. Honor a full model specification when the user supplies one.

## Agent specification grammar

- Alias: `codex-terra`, `codex-sol`, `codex-luna`, `grok`, `sonnet`, or `haiku`.
- Codex full specification: `codex:<model-id>@<effort>`.
- Grok full specification: `grok:<model-id>`.
- Claude full specification: `claude:<model-id>`.
- Supported Codex efforts depend on the installed Codex version and model. Pass the requested value unchanged and handle provider rejection through the fallback policy.
- Grok uses the Grok Build CLI default when no model ID is supplied. Do not invent or pass an effort value to Grok.

## Default aliases

| Alias | Execution path | Model | Default effort | Cost tier | Best use |
|---|---|---|---|---|---|
| `codex-luna` | `codex-plugin-cc` | `gpt-5.6-luna` | `medium` | lowest | focused fixes, tests, mechanical edits |
| `codex-terra` | `codex-plugin-cc` | `gpt-5.6-terra` | `medium` | medium | default coding, debugging, implementation |
| `codex-sol` | `codex-plugin-cc` | `gpt-5.6-sol` | `medium` | high | difficult migrations, architecture, security-sensitive coding |
| `grok` | `grok-plugin-cc` | Grok Build configured default | not supported | provider-dependent | adversarial review, second opinions, implementation proposals |
| `haiku` | native Claude subagent | `claude-haiku-4-5` | inherited | lowest Claude | search, inventory, summaries, simple read-only checks |
| `sonnet` | native Claude subagent | `claude-sonnet-5` | inherited | medium Claude | planning, documentation, analysis, targeted implementation or review |

Keep Fable as the parent coordinator. Do not select it as a routine worker unless the user explicitly names it.

## Profile defaults

### Economy

- Read-only lookup: `haiku`.
- Focused code change: `codex-luna`.
- Normal code change that needs stronger reasoning: `codex-terra`.
- Use `grok` only when explicitly requested; prefer it for a focused second opinion rather than routine lookup.
- Maximum workers: one.

### Balanced

- Implementation or debugging: `codex-terra`.
- Planning, analysis, or targeted review: `sonnet`.
- Use `grok` instead of the default reviewer when the user requests provider diversity or adversarial review.
- Maximum workers: two.
- Run a reviewer only when it has a distinct question or validation target.

### Quality

- Complex implementation: `codex-sol`.
- Independent planning or review: `sonnet`.
- Adversarial architecture or failure-mode review: `grok`.
- Cheap repository inventory may use `haiku` before expensive work.
- Maximum workers: three.

## Routing heuristics

- Prefer native Claude workers for prose, requirements analysis, repository discovery, and tasks that benefit from the parent environment's native tools.
- Prefer Codex workers for implementation, debugging, test repair, refactoring, and command-heavy repository work.
- Prefer Grok for proposal-only implementation alternatives, adversarial review, and a third-provider opinion on assumptions or failure modes.
- Prefer a different model family for high-risk review: review Codex-written changes with Claude or Grok, Claude-written changes with Codex or Grok, and Grok proposals with Claude or Codex.
- Prefer the cheapest worker that can complete the task with acceptable risk.
- Escalate from Luna to Terra to Sol only when task complexity or evidence justifies it.
- Avoid assigning the same whole task to multiple agents. Give each worker a distinct deliverable.

## Fallback order

Use fallbacks only when allowed by the invocation policy.

- `codex-sol` -> `codex-terra` -> installed Codex default.
- `codex-terra` -> `codex-luna` -> installed Codex default.
- `codex-luna` -> installed Codex default.
- `grok` -> `sonnet` for read-only review or `codex-terra` for implementation work.
- `sonnet` -> `haiku` for read-only low-risk work; otherwise require approval.
- `haiku` -> `sonnet`.

Never describe a provider fallback as the originally requested model. Report the worker actually used.

## Concurrency and write ownership

- Parallelize independent read-only investigation and review.
- Give the active checkout to one writer at a time.
- Treat Grok rescue as proposal-only. Do not count it as a writer until the coordinator or a designated worker applies its patch.
- If isolated worktrees are available, state ownership and integration order before starting multiple writers.
- Do not let a reviewer modify the implementation it is reviewing unless the coordinator explicitly changes its role after recording the findings.
