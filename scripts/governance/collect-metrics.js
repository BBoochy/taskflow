#!/usr/bin/env node
/**
 * Governance Metrics Collector
 * Gathers quality metrics and writes to .memory-layer/baselines/metrics.json
 */
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, '../../.memory-layer/baselines/metrics.json');
const SRC_DIR = path.join(__dirname, '../../src');
const TESTS_DIR = path.join(__dirname, '../../tests');

function countFiles(dir, ext) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir, { recursive: true }).filter(f => f.endsWith(ext)).length;
}

function countLOC(dir, ext) {
  if (!fs.existsSync(dir)) return 0;
  let total = 0;
  const files = fs.readdirSync(dir, { recursive: true }).filter(f => f.endsWith(ext));
  for (const file of files) {
    total += fs.readFileSync(path.join(dir, file), 'utf8').split('\n').filter(l => l.trim()).length;
  }
  return total;
}

const metrics = {
  timestamp: new Date().toISOString(),
  sourceFiles: countFiles(SRC_DIR, '.js'),
  testFiles: countFiles(TESTS_DIR, '.test.js'),
  sourceLOC: countLOC(SRC_DIR, '.js'),
  testLOC: countLOC(TESTS_DIR, '.js'),
  testToSourceRatio: 0,
};

if (metrics.sourceLOC > 0) {
  metrics.testToSourceRatio = +(metrics.testLOC / metrics.sourceLOC).toFixed(2);
}

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(metrics, null, 2));
console.log('Metrics collected:', JSON.stringify(metrics, null, 2));
