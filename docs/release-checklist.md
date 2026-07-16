# v1.2.0 Release Checklist

This checklist prepares a release candidate. Do **not** tag or publish until every item is complete and an explicit go-live approval is given.

## Correctness

- [x] Grok rescue documented as write-capable by default
- [x] Grok readonly/review paths documented separately
- [x] Codex review vs rescue split documented
- [x] Grok effort grammar documented consistently
- [x] Cursor alias and `cursor:<model-id>` grammar documented without an `@effort` suffix
- [x] Cursor rescue documented as write-capable by default; readonly/review paths documented separately
- [x] `grok` vs Cursor-hosted Grok model execution paths are disambiguated
- [x] Profile caps vs `agents=` precedence documented
- [x] Sonnet-to-Haiku fallback limited to read-only low-risk work
- [x] Compact handoff retains verification/evidence quality bars
- [x] Companion exit-code caveat documented (success determined from `Succeeded:` line or job `status`, never exit code)

## Automated validation

- [x] `npm test` passes
- [x] `./tests/smoke-install.sh` passes
- [ ] Windows `tests/smoke-install.ps1` passes
- [x] `node scripts/validate-skill.mjs` passes (allows Claude Code frontmatter extensions)
- [x] Routing fixtures enforced by `tests/check-consistency.mjs` (mutation-tested: reverting a fixture invariant fails the suite)
- [ ] GitHub Actions `validate` workflow is green on the release commit

## Manual provider matrix (disposable repos)

Record host/plugin versions and pass/fail for each:

- [ ] Native Haiku economy lookup
- [ ] Codex write via rescue
- [ ] Codex read-only review
- [ ] Grok read-only review
- [ ] Grok write rescue
- [ ] Cursor read-only review
- [ ] Cursor write rescue
- [ ] Explicit model selection
- [ ] Codex alias model IDs (`gpt-5.6-luna/terra/sol`) accepted by the installed Codex CLI (no offline catalog exists; requires a live run)
- [ ] `fallback=auto`
- [ ] `fallback=ask`
- [ ] `fallback=none`

## Launch assets

- [x] CHANGELOG entry for 1.2.0 is accurate
- [x] SECURITY.md and CONTRIBUTING.md are present
- [x] Issue templates are present
- [ ] Working tree is clean
- [ ] GitHub description/topics prepared
- [x] GitHub topics include `cursor`
- [ ] Release notes drafted
- [ ] Companion plugins released: `grok-plugin-cc` 0.3.0 and `cursor-plugin-cc` 0.2.0 (new minimums in the compatibility matrix)

## Explicit go-live (separate approval)

- [ ] Review [`docs/release-candidate-verification.md`](release-candidate-verification.md)
- [ ] Tag `v1.2.0` on the tested commit
- [ ] Create GitHub Release
- [ ] Confirm badges resolve to real CI/release artifacts
- [ ] Announce install command using `--skill orchestrate-agents`
