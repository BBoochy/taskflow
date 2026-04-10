const config = require('../../src/config');

describe('config', () => {
  it('has required default values', () => {
    expect(config.env).toBe('development');
    expect(config.port).toBe(3000);
    expect(config.host).toBe('localhost');
    expect(config.logLevel).toBe('info');
    expect(config.debug).toBe(true);
  });

  it('port is a valid number', () => {
    expect(typeof config.port).toBe('number');
    expect(config.port).toBeGreaterThan(0);
    expect(config.port).toBeLessThan(65536);
  });

  it('env is a recognized environment', () => {
    expect(['development', 'staging', 'production']).toContain(config.env);
  });
});
