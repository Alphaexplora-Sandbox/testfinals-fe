const fs = require('fs');
const path = require('path');
const { generateHtml } = require('../dist/index.js');

const html = generateHtml('/');
fs.writeFileSync(path.join(__dirname, '..', 'index.html'), html, 'utf-8');
