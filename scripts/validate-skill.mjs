#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillPath = path.join(root, "skills/orchestrate-agents/SKILL.md");
const text = fs.readFileSync(skillPath, "utf8");
const failures = [];

function fail(message) {
  failures.push(message);
}

const match = text.match(/^---\n([\s\S]*?)\n---\n/);
if (!match) {
  fail("SKILL.md must start with YAML frontmatter");
} else {
  const frontmatter = match[1];
  const allowed = new Set([
    "name",
    "description",
    "license",
    "compatibility",
    "metadata",
    "allowed-tools",
    // Claude Code extensions
    "argument-hint",
    "disable-model-invocation",
  ]);

  const keys = [];
  for (const line of frontmatter.split("\n")) {
    if (/^[A-Za-z0-9_-]+:/.test(line)) {
      keys.push(line.split(":")[0]);
    }
  }

  for (const key of keys) {
    if (!allowed.has(key)) fail(`Unexpected frontmatter field: ${key}`);
  }

  if (!frontmatter.includes("name: orchestrate-agents")) fail("name must be orchestrate-agents");
  if (!/description:\s+\S+/.test(frontmatter)) fail("description is required");
  if (!frontmatter.includes("license: MIT")) fail("license must be MIT");
  if (!frontmatter.includes("compatibility:")) fail("compatibility is required");
  const version = frontmatter.match(/^\s*version: "([^"]*)"\s*$/m)?.[1];
  if (!version) {
    fail("metadata.version must be a quoted string");
  } else if (!/^\d+\.\d+\.\d+$/.test(version)) {
    fail(`metadata.version must be semver (X.Y.Z), got "${version}"`);
  }
  if (!frontmatter.includes("disable-model-invocation: true")) {
    fail("disable-model-invocation must remain true");
  }

  const description = frontmatter.match(/description:\s+(.*)/)?.[1] ?? "";
  if (description.length > 1024) fail("description exceeds 1024 characters");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test("orchestrate-agents")) fail("invalid name");
}

if (failures.length > 0) {
  console.error("Skill validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Valid skill: skills/orchestrate-agents");
