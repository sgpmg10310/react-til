/**
 * Resolves relative imports in src/App.jsx and fails if the target file is missing.
 * Run: node scripts/verify-app-imports.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const appPath = path.join(root, 'src', 'App.jsx');
const appDir = path.dirname(appPath);

const src = fs.readFileSync(appPath, 'utf8');
const importRe = /import\s+[^'"]+\s+from\s+['"](\.\/[^'"]+)['"]/g;

function importExists(spec) {
  const abs = path.resolve(appDir, spec);
  const tries = [
    abs,
    `${abs}.jsx`,
    `${abs}.js`,
    path.join(abs, 'index.jsx'),
    path.join(abs, 'index.js'),
  ];
  return tries.some(p => fs.existsSync(p));
}

const missing = [];
let m;
while ((m = importRe.exec(src)) !== null) {
  const spec = m[1];
  if (!importExists(spec)) {
    missing.push(spec);
  }
}

if (missing.length) {
  console.error('[verify-app-imports] Missing modules referenced from src/App.jsx:');
  for (let i = 0; i < missing.length; i += 1) {
    console.error('  - ' + missing[i]);
  }
  process.exit(1);
}

console.log('[verify-app-imports] OK — all App.jsx relative imports resolve.');
