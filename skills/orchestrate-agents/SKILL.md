---
name: orchestrate-agents
description: Coordinate cost-aware multi-agent work across native Claude subagents, the codex-plugin-cc Codex bridge, and the grok-plugin-cc Grok Build bridge. Use when the user explicitly invokes /orchestrate-agents to delegate coding, research, debugging, review, or implementation tasks to named Claude, Codex, or Grok workers while keeping the parent model focused on decomposition and synthesis.
argument-hint: '[economy|balanced|quality] [agents=<list>] [fallback=auto|ask|none] -- <task>'
disable-model-invocation: true
---

# Orchestrate Agents

Treat the parent model as coordinator. Delegate substantive work when delegation will save parent-model effort or improve quality. Keep trivial work local when delegation overhead would be greater than completing it directly.

Parse the invocation from `$ARGUMENTS`:

- Accept `economy`, `balanced`, or `quality` as the first bare profile name, or accept `profile=<name>`.
- Accept `agents=<comma-separated aliases or full specifications>`.
- Accept `fallback=auto|ask|none`; default to `auto` for profile-selected agents and `ask` for explicitly named full model IDs.
- Treat text after `--` as the task. If `--` is absent, treat unrecognized text as the task.
- Default to `balanced` when no profile is supplied.

Examples:

```text
/orchestrate-agents economy -- investigate why the tests are flaky
/orchestrate-agents balanced agents=codex-terra,sonnet -- implement and review refresh-token rotation
/orchestrate-agents quality agents=codex:gpt-5.6-sol@high,claude:claude-sonnet-5 -- plan the database migration
/orchestrate-agents quality agents=codex-terra,grok -- implement the fix and challenge its failure modes
```

## Workflow

1. Restate the requested outcome in one sentence and identify constraints that agents must preserve.
2. Classify the task as trivial, focused, complex, or high risk.
3. Read [references/routing-policy.md](references/routing-policy.md) before selecting workers or interpreting agent specifications.
4. Create the smallest set of independent subtasks with explicit deliverables. Do not delegate vague duplicates of the whole request.
5. State a compact routing plan before spawning workers: subtask, worker, read/write mode, and dependency.
6. Dispatch independent read-only work in parallel. Dispatch dependent work sequentially.
7. Enforce the single-writer rule. Only one worker may edit the active checkout at a time. Serialize writers unless each has an isolated worktree and an explicit integration plan.
8. Wait for required results. Do not produce a final answer while a required worker is still running.
9. Validate outputs proportionally to risk. Prefer a different model family for an independent high-risk review.
10. Synthesize results without repeating each worker's full narrative. Report fallbacks, failures, changed files, verification, and remaining risks.

## Dispatch Claude workers

Use the native Agent/subagent mechanism. Set the per-invocation model to the resolved Claude model ID. Give each worker only the context needed for its subtask, plus repository constraints and the result contract below.

Use read-only tools for research and review tasks. For write tasks, identify the permitted files or subsystem and require tests or verification.

Do not allow workers to create further workers unless the user explicitly requests nested delegation.

## Dispatch Codex workers

Require the installed `codex-plugin-cc` integration.

Prefer the plugin's `codex:rescue` workflow with the resolved `--model` and `--effort` values. Use background execution for independent long-running work and retain the returned task or session identifier.

If the host cannot invoke the rescue skill directly, invoke the `codex:codex-rescue` Agent and include the exact model, effort, task, write scope, and result contract in its prompt.

Use explicit review mode for read-only work: instruct Codex not to edit files or apply fixes. Use fresh sessions for independent tasks and resume only when a subtask intentionally continues prior Codex work.

Never claim a Codex task succeeded from dispatch alone. Retrieve its completed result and inspect verification evidence.

## Dispatch Grok workers

Require the installed [`codemeall/grok-plugin-cc`](https://github.com/codemeall/grok-plugin-cc) integration and a working Grok Build CLI login.

Prefer the plugin's `grok:rescue` workflow for focused investigation or implementation proposals. Pass `--model <id>` only when the user supplies a full Grok model specification. The plugin does not expose a reasoning-effort flag.

Use `grok:review` for normal read-only review and `grok:adversarial-review` for architecture, reliability, security, scale, and assumption challenges. Use background execution for independent long-running work and retain the returned job identifier for `grok:status` and `grok:result`.

The Grok commands are user-only skills. When the host cannot invoke them programmatically, invoke the `grok:grok-rescue` Agent and explicitly request the needed rescue, review, or adversarial-review mode, exact model if supplied, repository scope, and result contract.

Treat Grok rescue output as proposal-only. Inspect any unified diff before applying it, and never report a proposed patch as an applied change. Applying an accepted Grok patch consumes the coordinator's writer slot or must be handed to the designated writer.

Never claim a Grok job succeeded from dispatch alone. Retrieve its completed result and inspect the patch, findings, and verification evidence.

## Control cost and concurrency

- `economy`: use at most one worker; choose the cheapest capable worker; skip independent review unless the task is high risk.
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

## Require this worker result contract

Append this contract to every delegated prompt:

```text
Return only a compact handoff:
STATUS: completed | blocked | failed
SUMMARY: at most 150 words
CHANGED: file paths, or none
VERIFICATION: commands/checks run and outcomes
EVIDENCE: relevant file:line references for read-only findings
RISKS: unresolved risks, or none
NEXT: one recommended next action, or none
```

Reject unsupported success claims. If a worker edited files but did not verify them, run appropriate verification in the coordinator or delegate a narrowly scoped validation task.

## Finish

Return one integrated result containing:

- outcome;
- agents actually used, including models and efforts where supported;
- changed files and verification;
- fallbacks or failed subtasks;
- remaining risks or required user decisions.

Do not expose internal chain-of-thought or copy raw worker transcripts unless the user asks for them.
