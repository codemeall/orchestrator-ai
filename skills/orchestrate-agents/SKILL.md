---
name: orchestrate-agents
description: Coordinate cost-aware multi-agent work across native Claude subagents, the codex-plugin-cc Codex bridge, the grok-plugin-cc Grok Build bridge, and cursor-plugin-cc Cursor workers. Use when the user explicitly invokes /orchestrate-agents to delegate coding, research, debugging, review, or implementation tasks to named Claude, Codex, Grok, or Cursor workers while keeping the parent model focused on decomposition and synthesis.
argument-hint: '[economy|balanced|quality] [agents=<list>] [fallback=auto|ask|none] -- <task>'
disable-model-invocation: true
license: MIT
compatibility: Requires Claude Code 2.1.203+. Codex workers need openai/codex-plugin-cc. Grok workers need codemeall/grok-plugin-cc 0.2.0+ and a working Grok Build CLI. Cursor workers need codemeall/cursor-plugin-cc 0.1.0+ and a working Cursor Agent CLI. Native Claude-only routing needs no external plugins.
metadata:
  author: codemeall
  version: "1.1.0"
---

# Orchestrate Agents

Treat the parent session model as coordinator. Delegate substantive work when delegation will save parent-model effort or improve quality. Keep trivial work local when delegation overhead would be greater than completing it directly, unless the user explicitly invoked `/orchestrate-agents economy` and expects a Haiku worker.

Parse the invocation from `$ARGUMENTS`:

- Accept `economy`, `balanced`, or `quality` as the first bare profile name, or accept `profile=<name>`.
- Accept `agents=<comma-separated aliases or full specifications>`.
- Accept `fallback=auto|ask|none`. Default to `auto` for profile-selected agents and aliases; default to `ask` for full model specifications (`provider:model` or `provider:model@effort`).
- Treat text after `--` as the task. If `--` is absent, treat unrecognized text as the task.
- Default to `balanced` when no profile is supplied.
- Profile caps are hard limits. If `agents=` lists more workers than the profile allows, keep the first N in list order, announce the truncation, and do not spawn the extras.

Examples:

```text
/orchestrate-agents economy -- investigate why the tests are flaky
/orchestrate-agents balanced agents=codex-terra,sonnet -- implement and review refresh-token rotation
/orchestrate-agents quality agents=codex:gpt-5.6-sol@high,claude:claude-sonnet-5 -- plan the database migration
/orchestrate-agents quality agents=codex-terra,grok -- implement the fix and challenge its failure modes
/orchestrate-agents quality agents=codex-terra,cursor -- implement the fix and get a cross-provider review
```

## Workflow

1. Restate the requested outcome in one sentence and identify constraints that agents must preserve.
2. Classify the task as trivial, focused, complex, or high risk. Map classification to profile defaults using [references/routing-policy.md](references/routing-policy.md).
3. Read [references/routing-policy.md](references/routing-policy.md) before selecting workers or interpreting agent specifications, unless every worker is already a full specification (for example `agents=claude:claude-haiku-4-5` or `agents=codex:gpt-5.6-terra@medium`). Aliases such as `haiku` or `codex-terra` still require the policy read. When skipping the full read for pinned full specs, still apply fallback and concurrency rules if a fallback becomes necessary.
4. Create the smallest set of independent subtasks with explicit deliverables. Do not delegate vague duplicates of the whole request.
5. State a compact routing plan before spawning workers: subtask, worker, read/write mode, and dependency.
6. Dispatch independent read-only work in parallel. Dispatch dependent work sequentially. Do not perform broad repository inventory the worker will repeat. The coordinator may read only the minimum files needed to scope the subtask.
7. Enforce the single-writer rule. Only one worker may edit the active checkout at a time. Serialize writers unless each has an isolated worktree and an explicit integration plan. Write-capable Grok rescue consumes the writer slot. Write-capable Cursor rescue consumes the writer slot.
8. Wait for required results. Do not produce a final answer while a required worker is still running.
9. Validate outputs proportionally to risk. Prefer a different model family for an independent high-risk review. Under `economy`, warn that independent cross-model review is unavailable and recommend `balanced` or `quality` when the task is high risk.
10. Synthesize results without repeating each worker's full narrative. Report fallbacks, failures, changed files, verification, and remaining risks.

## Dispatch Claude workers

Use the native Agent/subagent mechanism. Resolve each worker to a Claude model, then map it at dispatch time to an Agent-tool alias: `claude-haiku-4-5` → `haiku` or `claude-sonnet-5` → `sonnet`; never pass a full model ID to the native Agent tool. For a user-supplied `claude:<model-id>` full specification, map the ID to the closest accepted alias and report when the mapping is not exact. Give each worker only the context needed for its subtask, plus repository constraints and the result contract below.

Use read-only tools for research and review tasks. For write tasks, identify the permitted files or subsystem and require tests or verification.

For read-only lookups, keep the dispatch prompt lean: state the question, scope, and result contract. Always forward any user-supplied procedures, acceptance criteria, and required checks verbatim. Do not invent step-by-step investigation procedures the worker can derive on its own.

Do not allow workers to create further workers unless the user explicitly requests nested delegation.

## Dispatch Codex workers

Require the installed `codex-plugin-cc` integration.

For write or implementation work, prefer the plugin's `codex:rescue` workflow with the resolved `--model` and `--effort` values. If the host cannot invoke the rescue command directly, invoke the `codex:codex-rescue` Agent and include the exact model, effort, task, write scope, and result contract in its prompt.

For read-only review, use `codex:review` or `codex:adversarial-review`. Do not route read-only work through write-capable rescue with soft "do not edit" instructions.

Use fresh sessions for independent tasks and resume only when a subtask intentionally continues prior Codex work. Use background execution for independent long-running work and retain the returned task or session identifier.

Never claim a Codex task succeeded from dispatch alone. Retrieve its completed result and inspect verification evidence.

## Dispatch Grok workers

Require the installed [`codemeall/grok-plugin-cc`](https://github.com/codemeall/grok-plugin-cc) integration and a working Grok Build CLI login.

Grok slash commands are user-only. Prefer Agent-based dispatch that requests the needed mode explicitly:

- Write or apply-fix work: `grok:rescue` (write-capable by default). This consumes the writer slot.
- Proposal-only investigation: `grok:rescue --readonly`, or ask the Agent for readonly rescue semantics.
- Normal read-only review: `grok:review`.
- Architecture, reliability, security, scale, and assumption challenges: `grok:adversarial-review`.

Pass `--model <id>` and `--effort <level>` when the user supplies a full Grok specification `grok:<model-id>` or `grok:<model-id>@<effort>`. Supported efforts depend on the installed Grok plugin and CLI; pass the requested value unchanged and handle rejection through the fallback policy.

Use background execution for independent long-running work and retain the returned job identifier for `grok:status` and `grok:result`.

Never treat write-capable Grok rescue as proposal-only. Inspect any applied changes or proposed patch before reporting files as changed. A `--readonly` proposal is not an applied change until the coordinator or designated writer applies it.

Never claim a Grok job succeeded from dispatch alone. Retrieve its completed result and inspect the patch, findings, and verification evidence.

## Dispatch Cursor workers

Require the installed [`codemeall/cursor-plugin-cc`](https://github.com/codemeall/cursor-plugin-cc) integration and a working `cursor-agent` login.

Cursor slash commands are user-only. Dispatch through the `cursor:cursor-rescue` Agent and request the needed mode explicitly:

- Write or apply-fix work: `cursor:rescue` (write-capable by default). This consumes the writer slot.
- Proposal-only investigation: `cursor:rescue --readonly`, or ask the Agent for readonly rescue semantics.
- Normal read-only review: `cursor:review`.
- Architecture, reliability, security, scale, and assumption challenges: `cursor:adversarial-review`.

Pass `--model <id>` when the user supplies a full Cursor specification `cursor:<model-id>`. Cursor has no effort flag; effort variants are part of the model ID, for example `cursor:grok-4.5-xhigh`.

Use background execution for independent long-running work and retain the returned job identifier for `cursor:status` and `cursor:result`.

Never treat write-capable Cursor rescue as proposal-only. Inspect any applied changes or proposed patch before reporting files as changed. A `--readonly` proposal is not an applied change until the coordinator or designated writer applies it.

Never claim a Cursor job succeeded from dispatch alone. Retrieve its completed result and inspect the patch, findings, and verification evidence.

## Background jobs

For Codex, Grok, or Cursor background work:

1. Retain the task or job identifier at dispatch.
2. Poll status until completion, failure, or timeout.
3. On completion, fetch the result and inspect verification evidence before synthesizing.
4. On timeout or stuck status, cancel once, then apply one retry or the configured fallback.
5. Do not answer the user while a required background job is still running.

## Control cost and concurrency

- `economy`: use at most one worker; choose the cheapest capable worker; skip independent review unless the task is high risk, in which case warn and recommend a higher profile.
- `balanced`: use at most two workers; normally one implementer and one targeted reviewer or investigator.
- `quality`: use at most three workers; permit a stronger implementer and an independent cross-model review.
- Count workers, not subtasks. Reuse a worker for closely related sequential subtasks when its context remains useful.
- Permit one retry for a failed dispatch or clearly incomplete result. Escalate the model only after the cheaper worker fails, reports low confidence, or uncovers complexity that justifies escalation.
- Do not run multiple full-repository reviews by default.
- Keep parent-model commentary and synthesis concise.

## Handle unavailable workers

Never silently replace an explicitly requested model.

- With `fallback=auto`, announce the unavailable worker, select the nearest compatible alias from the routing policy, and record the substitution in the final response.
- With `fallback=ask`, pause before substituting an explicitly requested worker.
- With `fallback=none`, stop the affected subtask and report the blocker.
- Do not substitute a read-only worker with a writer or broaden permissions during fallback.
- `sonnet` may fall back to `haiku` automatically only for read-only low-risk work. For write, planning, or high-risk work, treat that substitution as `fallback=ask` even when the invocation default is `auto`.

## Require this worker result contract

Choose the contract by task type and append it to every delegated prompt.

For trivial read-only economy lookups, use the compact contract:

```text
Return only a compact handoff:
STATUS: completed | blocked | failed
SUMMARY: at most 80 words
EVIDENCE: file:line references
VERIFICATION: checks run and outcomes, or omit if none beyond the cited reads
```

For focused read-only investigations, use the full contract without `CHANGED`. For write tasks, multi-worker runs, complex investigations, and high-risk work, use the full contract:

```text
Return only a compact handoff:
STATUS: completed | blocked | failed
SUMMARY: at most 150 words
CHANGED: file paths (omit if none)
VERIFICATION: commands/checks run and outcomes
EVIDENCE: relevant file:line references for read-only findings
RISKS: unresolved risks (omit if none)
NEXT: one recommended next action only if directly implied by findings; otherwise omit
```

Omit empty sections. Do not emit filler such as `CHANGED: none` or `RISKS: none`.

Reject unsupported success claims. If a worker edited files but did not verify them, run appropriate verification in the coordinator or delegate a narrowly scoped validation task.

## Finish

Return one integrated result.

For a single-worker read-only result, pass through the worker's SUMMARY and EVIDENCE with at most 1-2 sentences of added judgment. Do not rewrite the findings. Still report:

- the worker actually used, including model and effort where supported;
- whether EVIDENCE was spot-checked (`verified` or `not verified`);
- any fallback or failure;
- remaining risks only if present.

For multi-worker or write tasks, return one integrated result containing:

- outcome;
- agents actually used, including models and efforts where supported;
- changed files and verification;
- fallbacks or failed subtasks;
- remaining risks or required user decisions.

Do not expose internal chain-of-thought or copy raw worker transcripts unless the user asks for them.
