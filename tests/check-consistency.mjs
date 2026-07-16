#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillPath = path.join(root, "skills/orchestrate-agents/SKILL.md");
const policyPath = path.join(root, "skills/orchestrate-agents/references/routing-policy.md");
const readmePath = path.join(root, "README.md");
const openaiYamlPath = path.join(root, "skills/orchestrate-agents/agents/openai.yaml");
const changelogPath = path.join(root, "CHANGELOG.md");
const packagePath = path.join(root, "package.json");
const fixturesPath = path.join(root, "tests/fixtures/routing-cases.md");

const skill = fs.readFileSync(skillPath, "utf8");
const policy = fs.readFileSync(policyPath, "utf8");
const readme = fs.readFileSync(readmePath, "utf8");
const openaiYaml = fs.readFileSync(openaiYamlPath, "utf8");
const changelog = fs.readFileSync(changelogPath, "utf8");
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const fixtures = fs.readFileSync(fixturesPath, "utf8");

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function has(text, needle) {
  return text.includes(needle);
}

assert(has(skill, "license: MIT"), "SKILL.md must declare MIT license");
assert(has(skill, "compatibility:"), "SKILL.md must declare compatibility");
assert(has(skill, "disable-model-invocation: true"), "SKILL.md must remain user-invoked only");
assert(has(skill, "argument-hint:"), "SKILL.md must keep Claude argument-hint");
assert(has(skill, "claude:claude-haiku-4-5"), "SKILL.md must use a valid pinned Claude full-spec example");
assert(!has(skill, "agents=claude:haiku"), "SKILL.md must not use invalid claude:haiku full-spec example");
assert(has(skill, "Write-capable Grok rescue consumes the writer slot"), "SKILL.md must treat Grok rescue as write-capable by default");
assert(has(skill, "Write-capable Cursor rescue"), "SKILL.md must treat Cursor rescue as write-capable by default");
assert(!has(skill, "Treat Grok rescue output as proposal-only"), "SKILL.md must not claim Grok rescue is always proposal-only");
assert(has(skill, "codex:review"), "SKILL.md must route Codex read-only work through review");
assert(has(skill, "grok:<model-id>@<effort>"), "SKILL.md must document Grok effort grammar");
assert(has(skill, "cursor:review"), "SKILL.md must route Cursor read-only work through review");
assert(has(skill, "cursor:<model-id>"), "SKILL.md must document Cursor model grammar");
assert(has(skill, "Profile caps are hard limits"), "SKILL.md must define profile-cap precedence");
assert(has(skill, "Always forward any user-supplied procedures"), "SKILL.md must preserve user-supplied procedures");
assert(has(skill, "whether EVIDENCE was spot-checked"), "SKILL.md single-worker finish must retain evidence validation");
assert(has(skill, "sonnet` may fall back to `haiku` automatically only for read-only low-risk work"), "SKILL.md must constrain sonnet->haiku fallback");

assert(has(policy, "grok:<model-id>@<effort>"), "routing-policy.md must support Grok effort grammar");
assert(has(policy, "Write-capable Grok rescue"), "routing-policy.md must treat write-capable Grok rescue as a writer");
assert(has(policy, "cursor:<model-id>"), "routing-policy.md must support Cursor model grammar");
assert(has(policy, "Write-capable Cursor rescue"), "routing-policy.md must treat write-capable Cursor rescue as a writer");
assert(!has(policy, "Treat Grok rescue as proposal-only"), "routing-policy.md must not claim Grok rescue is proposal-only");
assert(has(policy, "Classification to profile mapping"), "routing-policy.md must map classifications to profiles");
assert(has(policy, "for read-only low-risk work only; otherwise require approval"), "routing-policy.md must keep sonnet->haiku approval rule");

assert(has(readme, "--skill orchestrate-agents"), "README must use current Skills CLI --skill syntax");
assert(has(readme, "gh skill update orchestrate-agents"), "README must use valid gh skill update syntax");
assert(!has(readme, "gh skill update orchestrate-agents --agent claude-code --scope user"), "README must not use invalid gh skill update flags");
assert(has(readme, "npx skills remove orchestrate-agents -g"), "README must document Skills CLI uninstall");
assert(has(readme, "Grok rescue is write-capable by default"), "README must document write-capable Grok rescue");
assert(has(readme, "Cursor rescue is write-capable by default"), "README must document write-capable Cursor rescue");
assert(has(readme, "cursor:<model-id>"), "README must document Cursor model grammar");
assert(has(readme, "Compatibility matrix"), "README must include a compatibility matrix");
assert(has(readme, "Quick start (Claude-only)"), "README must include Claude-only quick start");
assert(has(readme, "Permission boundaries"), "README must document permission boundaries");
assert(has(readme, "Getting help"), "README must document a support path");
assert(has(readme, "grok:<model-id>@<effort>"), "README must document Grok effort grammar");

assert(has(openaiYaml, "allow_implicit_invocation: false"), "openai.yaml must keep implicit invocation disabled");

const skillVersion = skill.match(/^\s*version: "([^"]+)"/m)?.[1];
const openaiVersion = openaiYaml.match(/^\s*version: "([^"]+)"/m)?.[1];
assert(skillVersion, "SKILL.md must declare a quoted metadata.version");
assert(
  skillVersion && /^\d+\.\d+\.\d+$/.test(skillVersion),
  `SKILL.md metadata.version must be semver (X.Y.Z), got "${skillVersion}"`
);
assert(
  skillVersion === openaiVersion,
  `openai.yaml version (${openaiVersion}) must match SKILL.md metadata.version (${skillVersion})`
);

const changelogVersion = changelog.match(/^## \[(\d+\.\d+\.\d+)\]/m)?.[1];
assert(
  changelogVersion === skillVersion,
  `CHANGELOG.md top entry (${changelogVersion}) must match SKILL.md metadata.version (${skillVersion})`
);
assert(
  pkg.version === skillVersion,
  `package.json version (${pkg.version}) must match SKILL.md metadata.version (${skillVersion})`
);
assert(pkg.license === "MIT", "package.json must declare MIT license");

// Routing fixtures: parse tests/fixtures/routing-cases.md and enforce its invariants.
const profileCaps = { economy: 1, balanced: 2, quality: 3 };
assert(
  has(skill, "`economy`: use at most one worker") &&
    has(skill, "`balanced`: use at most two workers") &&
    has(skill, "`quality`: use at most three workers"),
  "SKILL.md must state the economy=1 / balanced=2 / quality=3 worker caps the fixtures rely on"
);

const fixtureCases = [];
let currentCase = null;
for (const line of fixtures.split("\n")) {
  const heading = line.match(/^### (.+)$/);
  if (heading) {
    currentCase = { name: heading[1].trim(), fields: {} };
    fixtureCases.push(currentCase);
    continue;
  }
  const field = currentCase && line.match(/^- ([A-Za-z]+): (.+)$/);
  if (field) currentCase.fields[field[1]] = field[2].trim();
}

assert(fixtureCases.length > 0, "routing-cases.md must define at least one fixture case");

const fullSpecPattern = /^(claude|codex|grok|cursor):\S+$/;
for (const { name, fields } of fixtureCases) {
  for (const required of ["invocation", "profile", "maxWorkers", "expectedWorkers", "requirePolicyRead"]) {
    assert(fields[required], `fixture ${name} must declare ${required}`);
  }
  if (!fields.profile || !fields.maxWorkers || !fields.invocation) continue;

  const cap = profileCaps[fields.profile];
  assert(cap !== undefined, `fixture ${name} uses unknown profile "${fields.profile}"`);
  assert(
    Number(fields.maxWorkers) === cap,
    `fixture ${name}: maxWorkers (${fields.maxWorkers}) must equal the ${fields.profile} cap (${cap})`
  );

  const expected = (fields.expectedWorkers ?? "")
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((worker) => worker.trim())
    .filter(Boolean);
  assert(
    expected.length > 0 && expected.length <= cap,
    `fixture ${name}: expectedWorkers count (${expected.length}) must be between 1 and the profile cap (${cap})`
  );

  // The policy read may be skipped only when every requested agent is a full provider:model spec.
  const agentsList = fields.invocation.match(/agents=([^\s`]+)/)?.[1];
  const requestedAgents = agentsList ? agentsList.split(",").map((agent) => agent.trim()) : [];
  const allFullSpecs = requestedAgents.length > 0 && requestedAgents.every((agent) => fullSpecPattern.test(agent));
  if (fields.requirePolicyRead === "false") {
    assert(
      allFullSpecs,
      `fixture ${name}: requirePolicyRead may be false only when every agent in the invocation is a full provider:model specification`
    );
  } else {
    assert(
      fields.requirePolicyRead === "true",
      `fixture ${name}: requirePolicyRead must be "true" or "false", got "${fields.requirePolicyRead}"`
    );
    assert(
      !allFullSpecs || requestedAgents.length === 0,
      `fixture ${name}: requirePolicyRead should be false when every requested agent is a full specification`
    );
  }
}

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
  "tests/fixtures/routing-cases.md",
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
