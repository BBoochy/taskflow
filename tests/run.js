/**
 * Minimal test runner for TaskFlow.
 * No dependencies — uses Node.js assert module.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

console.log('Running TaskFlow tests...\n');

// --- Smoke tests: verify project structure ---

test('src/index.html exists', () => {
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'src', 'index.html')));
});

test('src/app.js exists', () => {
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'src', 'app.js')));
});

test('src/styles.css exists', () => {
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'src', 'styles.css')));
});

test('index.html has app container', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'src', 'index.html'), 'utf8');
  assert.ok(html.includes('id="app"'), 'Missing <div id="app">');
});

test('index.html loads app.js', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'src', 'index.html'), 'utf8');
  assert.ok(html.includes('app.js'), 'Missing script tag for app.js');
});

// --- Summary ---

console.log(`\n${passed + failed} tests, ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
