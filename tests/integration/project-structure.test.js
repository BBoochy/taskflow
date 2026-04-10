const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

describe('Project Structure Integration', () => {
  it('src/index.html exists and has required elements', () => {
    const html = fs.readFileSync(path.join(ROOT, 'src', 'index.html'), 'utf8');
    expect(html).toContain('id="app"');
    expect(html).toContain('app.js');
    expect(html).toContain('styles.css');
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('src/app.js is valid JavaScript', () => {
    const content = fs.readFileSync(path.join(ROOT, 'src', 'app.js'), 'utf8');
    expect(() => new Function(content)).not.toThrow();
  });

  it('src/config.js exports valid config object', () => {
    const config = require('../../src/config');
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
    expect(config).toHaveProperty('env');
    expect(config).toHaveProperty('port');
    expect(config).toHaveProperty('host');
  });

  it('package.json has required fields', () => {
    const pkg = require('../../package.json');
    expect(pkg.name).toBe('taskflow');
    expect(pkg.version).toBeDefined();
    expect(pkg.scripts.test).toBeDefined();
  });
});
