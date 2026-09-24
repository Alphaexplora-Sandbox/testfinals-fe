export const SERVICE_NAME = 'testfinals-frontend';
export { App } from './App';
export { startServer, generateHtml } from './server';

// If run directly from CLI (e.g. ts-node src/index.ts or node dist/index.js)
if (typeof require !== 'undefined' && require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { startServer: run } = require('./server');
  run();
}