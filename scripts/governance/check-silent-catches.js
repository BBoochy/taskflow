#!/usr/bin/env node
/**
 * Iron Dome Ratchet: Silent Catch Detection
 * Empty/trivial catch blocks can only go down, never up.
 */
const fs = require('fs');
const path = require('path');

const BASELINE_FILE = path.join(__dirname, '../../.memory-layer/baselines/silent-catches.json');
const SRC_DIR = path.join(__dirname, '../../src');
const MARKER = '// SILENT_CATCH:';

function countSilentCatches(dir) {
  let count = 0;
  if (!fs.existsSync(dir)) return count;
  const files = fs.readdirSync(dir, { recursive: true });
  for (const file of files) {
    if (!file.endsWith('.js')) continue;
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    const catches = content.match(/catch\s*\([^)]*\)\s*\{[^}]*\}/g) || [];
    for (const c of catches) {
      const body = c.replace(/catch\s*\([^)]*\)\s*\{/, '').replace(/\}$/, '').trim();
      if (!body || (!body.includes('console') && !body.includes('throw') && !body.includes('log') && !body.includes(MARKER))) {
        count++;
      }
    }
  }
  return count;
}

function loadBaseline() {
  if (fs.existsSync(BASELINE_FILE)) return JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
  return null;
}

function saveBaseline(count) {
  fs.mkdirSync(path.dirname(BASELINE_FILE), { recursive: true });
  fs.writeFileSync(BASELINE_FILE, JSON.stringify({ silentCatches: count, updatedAt: new Date().toISOString() }, null, 2));
}

const current = countSilentCatches(SRC_DIR);
const baseline = loadBaseline();

if (!baseline) {
  saveBaseline(current);
  console.log(`Baseline created: ${current} silent catches`);
  process.exit(0);
}

if (current > baseline.silentCatches) {
  console.error(`BLOCKED: Silent catches increased (${baseline.silentCatches} -> ${current})`);
  console.error('Fix: Add error handling or mark with // SILENT_CATCH: reason');
  process.exit(1);
}

if (current < baseline.silentCatches) {
  saveBaseline(current);
  console.log(`Ratcheted down: ${baseline.silentCatches} -> ${current}`);
} else {
  console.log(`OK: ${current} silent catches (baseline: ${baseline.silentCatches})`);
}
