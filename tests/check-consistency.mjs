#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillPath = path.join(root, "skills/orchestrate-agents/SKILL.md");
const policyPath = path.join(root, "skills/orchestrate-agents/references/routing-policy.md");
const readmePath = path.join(root, "README.md");
const openaiYamlPath = path.join(root, "skills/orchestrate-agents/agents/openai.yaml");

const skill = fs.readFileSync(skillPath, "utf8");
const policy = fs.readFileSync(policyPath, "utf8");
const readme = fs.readFileSync(readmePath, "utf8");
const openaiYaml = fs.readFileSync(openaiYamlPath, "utf8");

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function has(text, needle) {
  return text.includes(needle);
}

assert(has(skill, 'version: "1.0.0"'), "SKILL.md must declare metadata.version 1.0.0");
assert(has(skill, "license: MIT"), "SKILL.md must declare MIT license");
assert(has(skill, "compatibility:"), "SKILL.md must declare compatibility");
assert(has(skill, "disable-model-invocation: true"), "SKILL.md must remain user-invoked only");
assert(has(skill, "argument-hint:"), "SKILL.md must keep Claude argument-hint");
assert(has(skill, "claude:claude-haiku-4-5"), "SKILL.md must use a valid pinned Claude full-spec example");
assert(!has(skill, "agents=claude:haiku"), "SKILL.md must not use invalid claude:haiku full-spec example");
assert(has(skill, "Write-capable Grok rescue consumes the writer slot"), "SKILL.md must treat Grok rescue as write-capable by default");
assert(!has(skill, "Treat Grok rescue output as proposal-only"), "SKILL.md must not claim Grok rescue is always proposal-only");
assert(has(skill, "codex:review"), "SKILL.md must route Codex read-only work through review");
assert(has(skill, "grok:<model-id>@<effort>"), "SKILL.md must document Grok effort grammar");
assert(has(skill, "Profile caps are hard limits"), "SKILL.md must define profile-cap precedence");
assert(has(skill, "Always forward any user-supplied procedures"), "SKILL.md must preserve user-supplied procedures");
assert(has(skill, "whether EVIDENCE was spot-checked"), "SKILL.md single-worker finish must retain evidence validation");
assert(has(skill, "sonnet` may fall back to `haiku` automatically only for read-only low-risk work"), "SKILL.md must constrain sonnet->haiku fallback");

assert(has(policy, "grok:<model-id>@<effort>"), "routing-policy.md must support Grok effort grammar");
assert(has(policy, "Write-capable Grok rescue"), "routing-policy.md must treat write-capable Grok rescue as a writer");
assert(!has(policy, "Treat Grok rescue as proposal-only"), "routing-policy.md must not claim Grok rescue is proposal-only");
assert(has(policy, "Classification to profile mapping"), "routing-policy.md must map classifications to profiles");
assert(has(policy, "for read-only low-risk work only; otherwise require approval"), "routing-policy.md must keep sonnet->haiku approval rule");

assert(has(readme, "--skill orchestrate-agents"), "README must use current Skills CLI --skill syntax");
assert(has(readme, "gh skill update orchestrate-agents"), "README must use valid gh skill update syntax");
assert(!has(readme, "gh skill update orchestrate-agents --agent claude-code --scope user"), "README must not use invalid gh skill update flags");
assert(has(readme, "npx skills remove orchestrate-agents -g"), "README must document Skills CLI uninstall");
assert(has(readme, "Grok rescue is write-capable by default"), "README must document write-capable Grok rescue");
assert(has(readme, "Compatibility matrix"), "README must include a compatibility matrix");
assert(has(readme, "Quick start (Claude-only)"), "README must include Claude-only quick start");
assert(has(readme, "Permission boundaries"), "README must document permission boundaries");
assert(has(readme, "Getting help"), "README must document a support path");
assert(has(readme, "grok:<model-id>@<effort>"), "README must document Grok effort grammar");

assert(has(openaiYaml, "allow_implicit_invocation: false"), "openai.yaml must keep implicit invocation disabled");

const requiredFiles = [
  "CHANGELOG.md",
  "SECURITY.md",
  "CONTRIBUTING.md",
  "docs/examples/economy-readonly.md",
  "docs/examples/balanced-implement-review.md",
  "docs/examples/quality-cross-model.md",
  "docs/release-checklist.md",
  "docs/release-candidate-verification.md",
  ".github/workflows/validate.yml",
  "scripts/validate-skill.mjs",
  "tests/smoke-install.sh",
  "tests/smoke-install.ps1",
  "package.json",
];

for (const relative of requiredFiles) {
  assert(fs.existsSync(path.join(root, relative)), `Missing required release file: ${relative}`);
}

if (failures.length > 0) {
  console.error("Consistency checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Consistency checks passed.");
