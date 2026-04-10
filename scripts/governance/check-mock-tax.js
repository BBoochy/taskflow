#!/usr/bin/env node
/**
 * Rising Tide: Mock Tax Enforcer (2x Rule)
 * If test LOC > 2x source LOC due to mocking, reject the test.
 */
const fs = require('fs');
const path = require('path');

const MAX_RATIO = 2.0;
const MIN_SOURCE_LINES = 10;
const TESTS_DIR = path.join(__dirname, '../../tests/unit');
const SRC_DIR = path.join(__dirname, '../../src');

function countLines(file) {
  if (!fs.existsSync(file)) return 0;
  return fs.readFileSync(file, 'utf8').split('\n').filter(l => l.trim() && !l.trim().startsWith('//')).length;
}

function mapTestToSource(testFile) {
  const base = path.basename(testFile).replace('.test.js', '.js');
  return path.join(SRC_DIR, base);
}

let violations = 0;

if (fs.existsSync(TESTS_DIR)) {
  const tests = fs.readdirSync(TESTS_DIR).filter(f => f.endsWith('.test.js'));
  for (const test of tests) {
    const testPath = path.join(TESTS_DIR, test);
    const srcPath = mapTestToSource(testPath);
    const testLines = countLines(testPath);
    const srcLines = countLines(srcPath);
    if (srcLines >= MIN_SOURCE_LINES) {
      const ratio = testLines / srcLines;
      if (ratio > MAX_RATIO) {
        console.error(`MOCK TAX: ${test} (${testLines} LOC) > 2x source (${srcLines} LOC) = ${ratio.toFixed(1)}x`);
        violations++;
      }
    }
  }
}

if (violations > 0) {
  console.error(`${violations} test(s) exceed 2x mock tax. Delete unit test, write integration test.`);
  process.exit(1);
}
console.log('OK: All unit tests within 2x mock tax limit');
