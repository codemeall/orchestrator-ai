# Orchestrate Agents

A cost-aware Claude Code skill that delegates work across native Claude subagents and OpenAI Codex workers.

Use Claude Fable as a thin coordinator while lower-cost agents handle repository discovery, implementation, debugging, testing, and targeted review. The skill supports named agents, three cost profiles, bounded concurrency, model fallbacks, and a single-writer rule that protects the active checkout.

## What it does

- Routes Claude-native work to Sonnet 5 or Haiku 4.5.
- Routes coding work to GPT-5.6 Luna, Terra, or Sol through [`codex-plugin-cc`](https://github.com/openai/codex-plugin-cc).
- Lets you select agents and reasoning effort per invocation.
- Keeps Fable focused on decomposition, coordination, and final synthesis.
- Runs independent read-only tasks in parallel while allowing only one writer in the active checkout.
- Requires compact, verifiable handoffs from every worker.
- Prevents automatic invocation so expensive multi-agent runs start only when you type `/orchestrate-agents`.

## Requirements

1. [Claude Code](https://code.claude.com/docs/en/overview), version 2.1.203 or newer recommended.
2. The [Codex plugin for Claude Code](https://github.com/openai/codex-plugin-cc).
3. A working Codex login using a ChatGPT account or OpenAI API key.
4. Access to the models you select. GPT-5.6 availability can vary by account and rollout stage.

Install and check the Codex integration from inside Claude Code:

```text
/plugin marketplace add openai/codex-plugin-cc
/plugin install codex@openai-codex
/reload-plugins
/codex:setup
```

## Install

First clone the repository and enter it:

```sh
git clone https://github.com/<owner>/<repository>.git
cd <repository>
```

Replace `<owner>` and `<repository>` with the values shown on the repository's GitHub page.

### macOS or Linux

Run the installer:

```sh
./install.sh
```

The installer creates a symbolic link at:

```text
~/.claude/skills/orchestrate-agents
```

If `CLAUDE_CONFIG_DIR` is set, the skill is installed under that directory instead of `~/.claude`.

### Windows PowerShell

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

The installer tries to create a symbolic link. If Windows does not permit symbolic links, it copies the skill directory instead.

### Manual installation

Copy or link the `orchestrate-agents` directory into your personal Claude Code skills directory:

```text
~/.claude/skills/orchestrate-agents/
├── SKILL.md
├── agents/
└── references/
```

On macOS or Linux:

```sh
mkdir -p "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills"
ln -s "$PWD/orchestrate-agents" "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/orchestrate-agents"
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
/orchestrate-agents [profile] [agents=<list>] [fallback=auto|ask|none] -- <task>
```

The default profile is `balanced`.

### Profiles

| Profile | Maximum workers | Intended use |
|---|---:|---|
| `economy` | 1 | Cheapest capable worker; no extra review unless risk demands it |
| `balanced` | 2 | Normal implementation plus targeted investigation or review |
| `quality` | 3 | Complex work with stronger reasoning and cross-model validation |

### Built-in agent aliases

| Alias | Provider | Default model | Typical role |
|---|---|---|---|
| `codex-luna` | Codex | `gpt-5.6-luna`, medium effort | Focused fixes, tests, mechanical edits |
| `codex-terra` | Codex | `gpt-5.6-terra`, medium effort | General coding, debugging, implementation |
| `codex-sol` | Codex | `gpt-5.6-sol`, medium effort | Migrations, architecture, security-sensitive coding |
| `haiku` | Claude | `claude-haiku-4-5` | Search, inventory, summaries, simple read-only checks |
| `sonnet` | Claude | `claude-sonnet-5` | Planning, analysis, documentation, implementation, or review |

You may also provide full model specifications:

```text
codex:<model-id>@<effort>
claude:<model-id>
```

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

The detailed aliases, profile defaults, and fallback order live in [`orchestrate-agents/references/routing-policy.md`](orchestrate-agents/references/routing-policy.md).

## Customization

Edit [`orchestrate-agents/references/routing-policy.md`](orchestrate-agents/references/routing-policy.md) to change:

- model aliases;
- default reasoning effort;
- profile limits;
- fallback order;
- task-to-model routing preferences.

Keep [`orchestrate-agents/SKILL.md`](orchestrate-agents/SKILL.md) focused on orchestration behavior. Put model-catalog changes in the routing policy so the main skill remains stable.

## Updating

For symbolic-link installations, update the cloned repository:

```sh
git pull
```

The installed skill updates immediately because Claude Code reads it through the link.

For a copied Windows installation, remove the installed copy and rerun `install.ps1` after pulling updates.

## Uninstalling

macOS or Linux:

```sh
rm "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/orchestrate-agents"
```

Windows PowerShell:

```powershell
$ConfigDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME '.claude' }
Remove-Item -Recurse -Force (Join-Path $ConfigDir 'skills\orchestrate-agents')
```

Uninstalling removes the personal skill link or copy. It does not remove the cloned repository, Claude Code, Codex CLI, or `codex-plugin-cc`.

## Troubleshooting

### The skill does not appear in `/skills`

- Confirm `SKILL.md` exists at `~/.claude/skills/orchestrate-agents/SKILL.md`.
- Check `claude --version`; symlink discovery requires a recent Claude Code version.
- Restart Claude Code if the top-level personal `skills` directory was created after the session started.
- If `CLAUDE_CONFIG_DIR` is set, confirm the skill was installed beneath that directory.

### Codex delegation is unavailable

- Run `/codex:setup` in Claude Code.
- Confirm the `codex@openai-codex` plugin is enabled with `/plugin`.
- Run `codex login` in a terminal if Codex is not authenticated.

### A requested model is unavailable

- Use an alias such as `codex-terra` instead of a preview model ID.
- Choose `fallback=auto` to permit a reported fallback.
- Update the aliases in `routing-policy.md` to models available to your account.

### The installer reports an existing target

The installer refuses to overwrite an existing skill. Inspect the current path, remove or rename it deliberately, and run the installer again.

## Repository structure

```text
.
├── README.md
├── LICENSE
├── install.sh
├── install.ps1
└── orchestrate-agents/
    ├── SKILL.md
    ├── agents/
    │   └── openai.yaml
    └── references/
        └── routing-policy.md
```

## License

MIT. See [`LICENSE`](LICENSE).
