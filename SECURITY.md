# Security Policy

## Supported versions

Security fixes are accepted for the latest released version on `main`.

## Reporting a vulnerability

Do not open a public issue for security-sensitive reports.

Email or privately message the maintainers through GitHub Security Advisories for this repository when available. Include:

- a description of the issue;
- reproduction steps;
- affected install path (Skills CLI, local clone, or manual link);
- whether the issue can cause unintended repository writes, secret exposure, or unsafe provider invocation.

You should receive an acknowledgement within 7 days.

## Scope notes

This skill coordinates AI coding agents that can read and modify repositories and invoke external CLIs. Expected trusted-operator behavior includes:

- explicit `/orchestrate-agents` invocation;
- single-writer enforcement for the active checkout;
- read-only review paths for Codex, Grok, and Cursor review commands;
- write-capable Grok rescue only when intentionally selected;
- write-capable Cursor rescue only when intentionally selected.

Reports that depend solely on a user approving a dangerous task in an already-trusted local agent session are generally out of scope, but hardening suggestions are still welcome.
