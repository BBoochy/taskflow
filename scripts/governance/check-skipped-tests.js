#!/usr/bin/env node
/**
 * Test Discipline: Max 5% skipped tests
 */
const fs = require('fs');
const path = require('path');

const TESTS_DIR = path.join(__dirname, '../../tests');
const MAX_SKIP_PERCENT = 5;

let totalTests = 0;
let skippedTests = 0;

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir, { recursive: true });
  for (const file of files) {
    if (!file.endsWith('.test.js')) continue;
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    const itMatches = content.match(/\b(it|test)\s*\(/g) || [];
    const skipMatches = content.match(/\b(it|test|describe)\.skip\s*\(/g) || [];
    totalTests += itMatches.length;
    skippedTests += skipMatches.length;
  }
}

scan(TESTS_DIR);

if (totalTests === 0) {
  console.log('OK: No tests found');
  process.exit(0);
}

const skipPercent = (skippedTests / totalTests) * 100;
if (skipPercent > MAX_SKIP_PERCENT) {
  console.error(`BLOCKED: ${skipPercent.toFixed(1)}% tests skipped (max ${MAX_SKIP_PERCENT}%)`);
  console.error(`${skippedTests}/${totalTests} tests are skipped`);
  process.exit(1);
}
console.log(`OK: ${skipPercent.toFixed(1)}% skipped (${skippedTests}/${totalTests}, max ${MAX_SKIP_PERCENT}%)`);
