# Routing Policy

Use aliases so routine invocations remain stable when provider model catalogs change. Honor a full model specification when the user supplies one.

## Agent specification grammar

- Alias: `codex-terra`, `codex-sol`, `codex-luna`, `grok`, `cursor`, `sonnet`, or `haiku`.
- Codex full specification: `codex:<model-id>@<effort>`.
- Grok full specification: `grok:<model-id>` or `grok:<model-id>@<effort>`.
- Cursor full specification: `cursor:<model-id>` (no effort suffix; effort variants are distinct model IDs).
- Claude full specification: `claude:<model-id>`.
- Supported Codex and Grok efforts depend on the installed plugin and CLI. Pass the requested value unchanged and handle provider rejection through the fallback policy.
- When no Grok model ID is supplied, use the Grok Build CLI configured default.
- When no Cursor model ID is supplied, use Cursor `auto`.

## Default aliases

| Alias | Execution path | Model | Default effort | Cost tier | Best use |
|---|---|---|---|---|---|
| `codex-luna` | `codex-plugin-cc` | `gpt-5.6-luna` | `medium` | lowest | focused fixes, tests, mechanical edits |
| `codex-terra` | `codex-plugin-cc` | `gpt-5.6-terra` | `medium` | medium | default coding, debugging, implementation |
| `codex-sol` | `codex-plugin-cc` | `gpt-5.6-sol` | `medium` | high | difficult migrations, architecture, security-sensitive coding |
| `grok` | `grok-plugin-cc` | Grok Build configured default | medium when effort is requested | provider-dependent | adversarial review, second opinions, write rescue, readonly proposals |
| `cursor` | `cursor-plugin-cc` | Cursor `auto` | n/a; effort is part of the model ID | provider-dependent | alternate implementation, cross-provider review, write rescue |
| `haiku` | native Claude subagent | `claude-haiku-4-5` | inherited from parent session | lowest Claude | search, inventory, summaries, simple read-only checks |
| `sonnet` | native Claude subagent | `claude-sonnet-5` | inherited from parent session | medium Claude | planning, documentation, analysis, targeted implementation or review |

Keep the parent session model as coordinator. Do not select the parent coordinator as a routine worker unless the user explicitly names that model.

## Classification to profile mapping

| Classification | Typical profile default | Default worker |
|---|---|---|
| Trivial read-only lookup | `economy` | `haiku` |
| Focused code change | `economy` | `codex-luna` |
| Normal implementation or debugging | `balanced` | `codex-terra` |
| Complex or high-risk implementation | `quality` | `codex-sol` |
| Targeted review or analysis | `balanced` | `sonnet` |
| Adversarial or cross-provider review | `quality` | `grok` |

Honor an explicit user profile or `agents=` list over this table. Profile caps remain hard limits.

## Profile defaults

### Economy

- Read-only lookup: `haiku`.
- Focused code change: `codex-luna`.
- Normal code change that needs stronger reasoning: `codex-terra`.
- Use `grok` only when explicitly requested; prefer it for a focused second opinion rather than routine lookup.
- Use `cursor` only when explicitly requested; prefer it for alternate implementation or provider diversity rather than routine lookup.
- Maximum workers: one.
- High-risk work under economy cannot receive independent cross-model review; warn and recommend `balanced` or `quality`.

### Balanced

- Implementation or debugging: `codex-terra`.
- Planning, analysis, or targeted review: `sonnet`.
- Use `grok` instead of the default reviewer when the user requests provider diversity or adversarial review.
- Use `cursor` instead of the default implementer or reviewer when the user explicitly requests it or requests provider diversity.
- Maximum workers: two.
- Run a reviewer only when it has a distinct question or validation target.

### Quality

- Complex implementation: `codex-sol`.
- Independent planning or review: `sonnet`.
- Adversarial architecture or failure-mode review: `grok`.
- Use `cursor` when explicitly requested or for additional provider diversity.
- Cheap repository inventory may use `haiku` before expensive work.
- Maximum workers: three.

## Routing heuristics

- Prefer native Claude workers for prose, requirements analysis, repository discovery, and tasks that benefit from the parent environment's native tools.
- Prefer Codex workers for implementation, debugging, test repair, refactoring, and command-heavy repository work.
- Prefer Grok for write rescue when requested, readonly proposals, adversarial review, and a third-provider opinion on assumptions or failure modes.
- Prefer Cursor for alternate implementation when requested, cross-provider adversarial review, and fallback provider diversity.
- Prefer a different model family for high-risk review: review Codex-written changes with Claude, Grok, or Cursor; Claude-written changes with Codex, Grok, or Cursor; Grok-written changes with Claude, Codex, or Cursor; and Cursor-written changes with Claude, Codex, or Grok.
- Treat `grok` as the xAI Grok Build CLI provider and `cursor:grok-4.5-xhigh` as the Grok model served through Cursor; they are distinct execution paths.
- Prefer the cheapest worker that can complete the task with acceptable risk.
- Escalate from Luna to Terra to Sol only when task complexity or evidence justifies it.
- Avoid assigning the same whole task to multiple agents. Give each worker a distinct deliverable.
- Route Codex, Grok, and Cursor read-only work through review commands, not write-capable rescue.

## Fallback order

Use fallbacks only when allowed by the invocation policy.

- `codex-sol` -> `codex-terra` -> `codex-luna`.
- `codex-terra` -> `codex-luna` for mechanical or low-risk edits; for implementation that needed Terra reasoning, prefer `ask` or an alternate provider before downgrading.
- `codex-luna` -> installed Codex default reported by `/codex:setup`, otherwise stop under `fallback=none`.
- `grok` -> `sonnet` for read-only review or `codex-terra` for implementation work.
- `cursor` -> `codex-terra` for implementation work or `sonnet` for read-only review.
- `sonnet` -> `haiku` for read-only low-risk work only; otherwise require approval.
- `haiku` -> `sonnet`.

Never describe a provider fallback as the originally requested model. Report the worker actually used.

## Concurrency and write ownership

- Parallelize independent read-only investigation and review.
- Give the active checkout to one writer at a time.
- Write-capable Grok rescue (`grok:rescue` without `--readonly`) consumes the writer slot.
- Readonly Grok rescue, Grok review, and Grok adversarial review do not consume the writer slot.
- Write-capable Cursor rescue (`cursor:rescue` without `--readonly`) consumes the writer slot.
- Readonly Cursor rescue, Cursor review, and Cursor adversarial review do not consume the writer slot.
- If isolated worktrees are available, state ownership and integration order before starting multiple writers.
- Do not let a reviewer modify the implementation it is reviewing unless the coordinator explicitly changes its role after recording the findings.
