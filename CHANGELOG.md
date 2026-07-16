# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-07-16

### Added

- Failure-detection guidance: companion exit codes do not signal run success; coordinators must inspect the `Succeeded:` line or background job `status` before reporting success
- Routing fixtures in `tests/fixtures/routing-cases.md` are now parsed and enforced by `tests/check-consistency.mjs` (profile caps, worker counts, and policy-read rules)
- `package.json` now declares `version` and `license`, cross-checked against `SKILL.md` and `CHANGELOG.md`

### Changed

- Minimum plugin versions raised: `grok-plugin-cc` 0.3.0+ and `cursor-plugin-cc` 0.2.0+ (releases with meaningful exit codes)
- Version checks in `scripts/validate-skill.mjs` and `tests/check-consistency.mjs` are no longer hardcoded; they validate semver format and cross-file agreement

### Fixed

- `quality-grok-effort` fixture contradiction: `requirePolicyRead` is now `true`, matching its own rationale and SKILL.md rule
- README now states Claude Code 2.1.203+ is required (was "recommended"), matching SKILL.md compatibility
- `openai.yaml` default prompt uses `/orchestrate-agents` (was `$orchestrate-agents`)
- Supply-chain verification note now also covers the Cursor CLI installer

## [1.1.0] - 2026-07-12

### Added

- Cursor workers through `cursor-plugin-cc` for alternate implementation, write rescue, and cross-provider review
- Cursor alias and `cursor:<model-id>` full specifications, with Cursor `auto` as the default
- Cursor setup, troubleshooting, routing, fallback, and writer-slot documentation

### Changed

- Provider-diversity guidance now includes Cursor without changing the existing Codex and Grok profile defaults
- Skill metadata version bumped to 1.1.0

## [1.0.0] - 2026-07-10

### Added

- Cost-aware orchestration across Claude, Codex, and Grok workers
- Economy, balanced, and quality profiles with hard worker caps
- Compact and full worker handoff contracts
- Compatibility matrix, Claude-only quick start, and annotated examples
- Consistency tests, installer smoke tests, and GitHub Actions validation
- Security policy, contribution guide, issue templates, and release checklist

### Changed

- Grok rescue is documented as write-capable by default and consumes the writer slot
- Codex and Grok read-only work routes through review commands
- Grok effort grammar now matches Codex-style `@effort` specifications
- Single-worker read-only synthesis preserves evidence validation without re-narration
- Skills CLI install docs use `--skill orchestrate-agents`

### Fixed

- Invalid pinned Claude example (`claude:haiku`) replaced with `claude:claude-haiku-4-5`
- Sonnet-to-Haiku auto-fallback limited to read-only low-risk work
- Invalid `gh skill update` flags removed from README
