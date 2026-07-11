# Orchestrate Agents

A cost-aware Claude Code skill that delegates work across native Claude subagents, OpenAI Codex workers, and xAI Grok Build workers.

Use the parent Claude session as a thin coordinator while lower-cost agents handle repository discovery, implementation, debugging, testing, and targeted review. The skill supports named agents, three cost profiles, bounded concurrency, model fallbacks, and a single-writer rule that protects the active checkout.

[![Validate](https://github.com/codemeall/orchestrator-ai/actions/workflows/validate.yml/badge.svg)](https://github.com/codemeall/orchestrator-ai/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## What it does

- Routes Claude-native work to Sonnet 5 or Haiku 4.5.
- Routes coding work to GPT-5.6 Luna, Terra, or Sol through [`codex-plugin-cc`](https://github.com/openai/codex-plugin-cc).
- Routes write rescue, readonly proposals, reviews, and adversarial second opinions through [`codemeall/grok-plugin-cc`](https://github.com/codemeall/grok-plugin-cc).
- Lets you select agents, model IDs, and Codex or Grok reasoning effort per invocation.
- Keeps the parent session focused on decomposition, coordination, and final synthesis.
- Runs independent read-only tasks in parallel while allowing only one writer in the active checkout.
- Requires compact, verifiable handoffs from every worker.
- Prevents automatic invocation so expensive multi-agent runs start only when you type `/orchestrate-agents`.

## Quick start (Claude-only)

No Codex or Grok plugins required:

```sh
npx skills add codemeall/orchestrator-ai --skill orchestrate-agents -g -a claude-code -y
```

Then in Claude Code:

```text
/orchestrate-agents economy -- summarize the top-level package scripts
```

## Requirements

1. [Claude Code](https://code.claude.com/docs/en/overview), version 2.1.203 or newer recommended.
2. Install the provider plugins you intend to use:
   - [Codex plugin for Claude Code](https://github.com/openai/codex-plugin-cc) for Codex workers.
   - [Grok plugin for Claude Code](https://github.com/codemeall/grok-plugin-cc), version 0.2.0 or newer, for Grok workers.
3. Authenticate each selected provider. Native Claude-only routing does not require either external plugin.
4. Access to the models you select. Preview-model availability can vary by account and rollout stage.

### Compatibility matrix

| Component | Minimum / notes |
|---|---|
| Claude Code | 2.1.203+ recommended |
| Skills CLI | Current `npx skills` with `--skill` |
| GitHub CLI skills | `gh` 2.90.0+ |
| Codex plugin | `codex@openai-codex` via openai/codex-plugin-cc |
| Grok plugin | `grok@grok-plugin-cc` 0.2.0+ |
| PromptScript | Project-local installs only; no global skills dir |

### Set up Codex

Install and check the Codex integration from inside Claude Code:

```text
/plugin marketplace add openai/codex-plugin-cc
/plugin install codex@openai-codex
/reload-plugins
/codex:setup
```

### Set up Grok

Install and authenticate the official Grok Build CLI:

```sh
curl -fsSL https://x.ai/cli/install.sh | bash
grok login
```

On Windows PowerShell:

```powershell
irm https://x.ai/cli/install.ps1 | iex
grok login
```

Prefer verifying the installer source and comparing checksums when your environment requires supply-chain controls. Then install and verify the Grok plugin from inside Claude Code:

```text
/plugin marketplace add codemeall/grok-plugin-cc
/plugin install grok@grok-plugin-cc
/reload-plugins
/grok:setup
```

For non-interactive environments, set `XAI_API_KEY`. If another executable named `grok` is earlier on `PATH`, set `GROK_CLI` to the official Grok Build binary, commonly `~/.grok/bin/grok`.

## Install

### Recommended: install from GitHub

Install globally with the Skills CLI (works across Cursor, Claude Code, Codex, and most other agents):

```sh
npx skills add codemeall/orchestrator-ai --skill orchestrate-agents -g -y
```

`-g` installs into the Skills CLI global store and links into each supported agent. `-y` skips confirmation prompts.

If the summary shows `Failed to install 1` for PromptScript, that is expected: PromptScript is project-only. The skill is still installed for every other listed agent. Use a project-local install only if you need PromptScript or want the skill scoped to one repo:

```sh
npx skills add codemeall/orchestrator-ai --skill orchestrate-agents -y
```

Alternatively, with GitHub CLI (v2.90.0+):

```sh
gh skill install codemeall/orchestrator-ai orchestrate-agents --agent claude-code --scope user
```

### Local clone (Claude Code development)

Local clone installers target Claude Code only (`~/.claude/skills`). For Cursor, Codex, and other agents, prefer the Skills CLI path above.

```sh
git clone https://github.com/codemeall/orchestrator-ai.git
cd orchestrator-ai
./install.sh
```

On Windows PowerShell:

```powershell
git clone https://github.com/codemeall/orchestrator-ai.git
cd orchestrator-ai
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

The installer creates a symbolic link at `~/.claude/skills/orchestrate-agents` (or under `CLAUDE_CONFIG_DIR` when set). On Windows, if symbolic links are not permitted, it copies the skill directory instead. Re-running the Unix installer is idempotent when the existing symlink already points at this clone.

### Manual installation

Copy or link `skills/orchestrate-agents` into your personal Claude Code skills directory:

```text
~/.claude/skills/orchestrate-agents/
├── SKILL.md
├── agents/
└── references/
```

On macOS or Linux:

```sh
mkdir -p "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills"
ln -s "$PWD/skills/orchestrate-agents" "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/orchestrate-agents"
```

## Verify installation

Start Claude Code and run:

```text
/skills
```

Search for `orchestrate-agents`. It should appear as a personal, user-only skill. You can then invoke it directly:

```text
/orchestrate-agents economy -- investigate why the test suite is flaky
```

## Usage

General syntax:

```text
/orchestrate-agents [profile|profile=<name>] [agents=<list>] [fallback=auto|ask|none] -- <task>
```

The default profile is `balanced`.

### Profiles and cost expectations

| Profile | Maximum workers | Typical cost | Intended use |
|---|---:|---|---|
| `economy` | 1 | Lowest | Cheapest capable worker; no extra review unless risk demands it |
| `balanced` | 2 | Medium | Normal implementation plus targeted investigation or review |
| `quality` | 3 | Highest | Complex work with stronger reasoning and cross-model validation |

`agents=` defines intent. Profile caps are hard limits: excess workers are truncated in list order and reported. High-risk work under `economy` cannot receive independent cross-model review; the coordinator should warn and recommend `balanced` or `quality`.

### Built-in agent aliases

| Alias | Provider | Default model | Typical role |
|---|---|---|---|
| `codex-luna` | Codex | `gpt-5.6-luna`, medium effort | Focused fixes, tests, mechanical edits |
| `codex-terra` | Codex | `gpt-5.6-terra`, medium effort | General coding, debugging, implementation |
| `codex-sol` | Codex | `gpt-5.6-sol`, medium effort | Migrations, architecture, security-sensitive coding |
| `grok` | Grok Build | Configured Grok default | Write rescue, readonly proposals, adversarial review |
| `haiku` | Claude | `claude-haiku-4-5` | Search, inventory, summaries, simple read-only checks |
| `sonnet` | Claude | `claude-sonnet-5` | Planning, analysis, documentation, implementation, or review |

You may also provide full model specifications:

```text
codex:<model-id>@<effort>
grok:<model-id>
grok:<model-id>@<effort>
claude:<model-id>
```

### Permission boundaries

- Only one writer may edit the active checkout at a time.
- Codex and Grok write rescue consume the writer slot.
- Codex/Grok review and Grok `rescue --readonly` are read-only and do not consume the writer slot.
- Workers must return compact handoffs with evidence; the coordinator validates before claiming success.
- The skill never auto-invokes; you must type `/orchestrate-agents`.

### Examples

Use the cheapest suitable worker:

```text
/orchestrate-agents economy -- find the cause of the failing integration test
```

Implement with Codex and review with Sonnet:

```text
/orchestrate-agents balanced agents=codex-terra,sonnet -- implement refresh-token rotation and verify the security boundaries
```

Select an exact Codex model and reasoning effort:

```text
/orchestrate-agents quality agents=codex:gpt-5.6-sol@high,claude:claude-sonnet-5 -- plan and execute the database migration
```

Disable automatic model substitution:

```text
/orchestrate-agents balanced agents=codex-terra fallback=none -- fix the concurrency regression
```

Ask before substituting an unavailable model:

```text
/orchestrate-agents quality agents=codex:gpt-5.6-sol@high fallback=ask -- audit the authorization layer
```

Use Grok as an adversarial reviewer:

```text
/orchestrate-agents balanced agents=codex-terra,grok -- implement the retry fix and challenge its reliability assumptions
```

Select an exact Grok model and effort:

```text
/orchestrate-agents quality agents=sonnet,grok:grok-4.5@high -- design the migration and independently pressure-test the plan
```

Grok rescue is write-capable by default and consumes the writer slot. Use `grok:rescue --readonly`, `grok:review`, or `grok:adversarial-review` for proposal-only or review work. Never report a readonly proposal as an applied change.

Annotated session examples live in [`docs/examples/`](docs/examples/).

## How routing works

The parent Claude session:

1. Classifies and decomposes the request.
2. Selects the smallest capable worker set.
3. Gives every worker a distinct deliverable.
4. Parallelizes independent read-only tasks.
5. Serializes writes to the active checkout.
6. Waits for required results and checks verification evidence.
7. Uses cross-model review for high-risk work when the selected profile allows it.
8. Returns one integrated result rather than copying full worker transcripts.

The detailed aliases, profile defaults, and fallback order live in [`skills/orchestrate-agents/references/routing-policy.md`](skills/orchestrate-agents/references/routing-policy.md).

## Customization

Edit [`skills/orchestrate-agents/references/routing-policy.md`](skills/orchestrate-agents/references/routing-policy.md) to change:

- model aliases;
- default reasoning effort where supported;
- profile limits;
- fallback order;
- task-to-model routing preferences.

Keep [`skills/orchestrate-agents/SKILL.md`](skills/orchestrate-agents/SKILL.md) focused on orchestration behavior. Put model-catalog changes in the routing policy so the main skill remains stable.

`skills/orchestrate-agents/agents/openai.yaml` is Skills CLI / cross-agent metadata. It is not Claude Code routing configuration.

## Updating

For Skills CLI installs:

```sh
npx skills update orchestrate-agents -g
```

Or with GitHub CLI:

```sh
gh skill update orchestrate-agents
```

For symbolic-link installations from a local clone, update the cloned repository:

```sh
git pull
```

The installed skill updates immediately because Claude Code reads it through the link.

For a copied Windows installation, remove the installed copy and rerun `install.ps1` after pulling updates.

## Uninstalling

Skills CLI:

```sh
npx skills remove orchestrate-agents -g
```

Local Claude Code link or copy on macOS or Linux:

```sh
rm "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/orchestrate-agents"
```

Windows PowerShell:

```powershell
$ConfigDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME '.claude' }
Remove-Item -Recurse -Force (Join-Path $ConfigDir 'skills\orchestrate-agents')
```

Uninstalling removes the personal skill link or copy. It does not remove the cloned repository, Claude Code, provider CLIs, `codex-plugin-cc`, or `grok-plugin-cc`.

## Troubleshooting

### The skill does not appear in `/skills`

- Confirm `SKILL.md` exists at `~/.claude/skills/orchestrate-agents/SKILL.md` or the Skills CLI target for your agent.
- Check `claude --version`; symlink discovery requires a recent Claude Code version.
- Restart Claude Code if the top-level personal `skills` directory was created after the session started.
- If `CLAUDE_CONFIG_DIR` is set, confirm the skill was installed beneath that directory.

### Codex delegation is unavailable

- Run `/codex:setup` in Claude Code.
- Confirm the `codex@openai-codex` plugin is enabled with `/plugin`.
- Run `codex login` in a terminal if Codex is not authenticated.
- Prefer `/codex:review` for read-only work and `/codex:rescue` for writes.

### Grok delegation is unavailable

- Run `/grok:setup` in Claude Code.
- Confirm `grok@grok-plugin-cc` is enabled with `/plugin`.
- Run `grok login`, or set `XAI_API_KEY` for non-interactive use.
- If `PATH` resolves `grok` to a different tool, set `GROK_CLI` to the official Grok Build executable.
- Remember Grok slash commands are user-only; the coordinator should dispatch through the Grok Agent with an explicit mode.

### A requested model is unavailable

- Use an alias such as `codex-terra` or `grok` instead of a preview model ID.
- Choose `fallback=auto` to permit a reported fallback for aliases.
- Full model IDs default to `fallback=ask`.
- Update the aliases in `routing-policy.md` to models available to your account.
- Verify availability with `/codex:setup` or `/grok:setup`.

### The installer reports an existing target

The installer refuses to overwrite an existing skill unless the Unix symlink already points at this clone. Inspect the current path, remove or rename it deliberately, and run the installer again.

## Getting help

- Open a GitHub Issue for install failures, routing bugs, or model-availability problems.
- See [`SECURITY.md`](SECURITY.md) for vulnerability reporting.
- See [`CONTRIBUTING.md`](CONTRIBUTING.md) before changing routing policy or skill behavior.
- See [`CHANGELOG.md`](CHANGELOG.md) for release history.

## Repository structure

```text
.
├── README.md
├── LICENSE
├── CHANGELOG.md
├── SECURITY.md
├── CONTRIBUTING.md
├── package.json
├── install.sh
├── install.ps1
├── docs/
│   ├── examples/
│   └── release-checklist.md
├── scripts/
│   └── validate-skill.mjs
├── tests/
└── skills/
    └── orchestrate-agents/
        ├── SKILL.md
        ├── agents/
        │   └── openai.yaml
        └── references/
            └── routing-policy.md
```

## License

MIT. See [`LICENSE`](LICENSE).
