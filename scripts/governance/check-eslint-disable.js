#!/usr/bin/env node
/**
 * Escape Hatch Gate: No new lint suppressions
 * Blocks commits that add eslint-disable or eslint-disable-next-line comments.
 */
const fs = require('fs');
const path = require('path');

const BASELINE_FILE = path.join(__dirname, '../../.memory-layer/baselines/eslint-disables.json');
const SRC_DIR = path.join(__dirname, '../../src');

function countDisables(dir) {
  let count = 0;
  if (!fs.existsSync(dir)) return count;
  const files = fs.readdirSync(dir, { recursive: true });
  for (const file of files) {
    if (!file.endsWith('.js')) continue;
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    const matches = content.match(/eslint-disable/g);
    if (matches) count += matches.length;
  }
  return count;
}

function loadBaseline() {
  if (fs.existsSync(BASELINE_FILE)) return JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
  return null;
}

function saveBaseline(count) {
  fs.mkdirSync(path.dirname(BASELINE_FILE), { recursive: true });
  fs.writeFileSync(BASELINE_FILE, JSON.stringify({ disables: count, updatedAt: new Date().toISOString() }, null, 2));
}

const current = countDisables(SRC_DIR);
const baseline = loadBaseline();

if (!baseline) {
  saveBaseline(current);
  console.log(`Baseline created: ${current} eslint-disable comments`);
  process.exit(0);
}

if (current > baseline.disables) {
  console.error(`BLOCKED: eslint-disable count increased (${baseline.disables} -> ${current})`);
  process.exit(1);
}

if (current < baseline.disables) saveBaseline(current);
console.log(`OK: ${current} eslint-disable comments (baseline: ${baseline.disables})`);
