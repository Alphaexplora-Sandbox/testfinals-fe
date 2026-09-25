import { handleRequest, startServer, generateHtml } from './server';
import { App } from './App';

export const SERVICE_NAME = 'testfinals-frontend';
export { App, startServer, generateHtml, handleRequest };

// Vercel Serverless Function entry point:
// Vercel requires the default export to be a function (req, res) or http.Server.
export default handleRequest;

// Also assign to module.exports for pure CommonJS runtime compatibility in Vercel (@vercel/node)
if (typeof module !== 'undefined' && module.exports) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlerFn: any = handleRequest;
  handlerFn.default = handleRequest;
  handlerFn.SERVICE_NAME = SERVICE_NAME;
  handlerFn.App = App;
  handlerFn.startServer = startServer;
  handlerFn.generateHtml = generateHtml;
  handlerFn.handleRequest = handleRequest;
  module.exports = handlerFn;
}

// If run directly from CLI (e.g. ts-node src/index.ts or node dist/index.js)
if (typeof require !== 'undefined' && require.main === module) {
  startServer();
}