# v1.0.0 Release Checklist

This checklist prepares a release candidate. Do **not** tag or publish until every item is complete and an explicit go-live approval is given.

## Correctness

- [ ] Grok rescue documented as write-capable by default
- [ ] Grok readonly/review paths documented separately
- [ ] Codex review vs rescue split documented
- [ ] Grok effort grammar documented consistently
- [ ] Profile caps vs `agents=` precedence documented
- [ ] Sonnet-to-Haiku fallback limited to read-only low-risk work
- [ ] Compact handoff retains verification/evidence quality bars

## Automated validation

- [ ] `npm test` passes
- [ ] `./tests/smoke-install.sh` passes
- [ ] Windows `tests/smoke-install.ps1` passes
- [ ] `node scripts/validate-skill.mjs` passes (allows Claude Code frontmatter extensions)
- [ ] GitHub Actions `validate` workflow is green on the release commit

## Manual provider matrix (disposable repos)

Record host/plugin versions and pass/fail for each:

- [ ] Native Haiku economy lookup
- [ ] Codex write via rescue
- [ ] Codex read-only review
- [ ] Grok read-only review
- [ ] Grok write rescue
- [ ] Explicit model selection
- [ ] `fallback=auto`
- [ ] `fallback=ask`
- [ ] `fallback=none`

## Launch assets

- [ ] CHANGELOG entry for 1.0.0 is accurate
- [ ] SECURITY.md and CONTRIBUTING.md are present
- [ ] Issue templates are present
- [ ] Working tree is clean
- [ ] GitHub description/topics prepared
- [ ] Release notes drafted

## Explicit go-live (separate approval)

- [ ] Review [`docs/release-candidate-verification.md`](release-candidate-verification.md)
- [ ] Tag `v1.0.0` on the tested commit
- [ ] Create GitHub Release
- [ ] Confirm badges resolve to real CI/release artifacts
- [ ] Announce install command using `--skill orchestrate-agents`
