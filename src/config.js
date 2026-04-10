/**
 * Environment configuration with fail-fast validation.
 * Required variables cause a startup error if missing.
 */
const config = {
  env: 'development',
  port: 3000,
  host: 'localhost',
  logLevel: 'info',
  debug: true,
};

// No required env vars yet for vanilla JS + localStorage.
// When the project adds a backend or external APIs, add required
// variables here and validate them at startup:
//
//   const REQUIRED = ['DATABASE_URL', 'API_KEY'];
//   const missing = REQUIRED.filter(key => !process.env[key]);
//   if (missing.length) {
//     throw new Error(`Missing required env vars: ${missing.join(', ')}`);
//   }

export default config;
