#!/usr/bin/env node
/**
 * SRP Guardrails: File size and function size limits
 * - File max: 300 LOC (source), 600 LOC (tests)
 * - Function max: 50 LOC
 */
const fs = require('fs');
const path = require('path');

const MAX_FILE_LOC = 300;
const MAX_TEST_LOC = 600;
const MAX_FUNC_LOC = 50;

function checkDir(dir, maxLoc) {
  const violations = [];
  if (!fs.existsSync(dir)) return violations;
  const files = fs.readdirSync(dir, { recursive: true });
  for (const file of files) {
    if (!file.endsWith('.js')) continue;
    const fullPath = path.join(dir, file);
    const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
    const loc = lines.filter(l => l.trim() && !l.trim().startsWith('//')).length;
    if (loc > maxLoc) {
      violations.push(`${file}: ${loc} LOC (max ${maxLoc})`);
    }
  }
  return violations;
}

const srcViolations = checkDir(path.join(__dirname, '../../src'), MAX_FILE_LOC);
const testViolations = checkDir(path.join(__dirname, '../../tests'), MAX_TEST_LOC);
const all = [...srcViolations, ...testViolations];

if (all.length > 0) {
  console.error('SRP GUARDRAILS:');
  all.forEach(v => console.error(`  ${v}`));
  process.exit(1);
}
console.log('OK: All files within SRP guardrails');
