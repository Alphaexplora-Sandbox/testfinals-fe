// Entry point for Vercel Serverless Function and Node.js runtimes
const handler = require('./dist/index.js');

module.exports = handler;
module.exports.default = handler;
