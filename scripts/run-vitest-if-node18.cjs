/**
 * Node 18 미만이면 Vitest를 건너뜁니다(구형 Node에서 import 오류 방지).
 * Node 18+ 에서만 `vitest run` 실행.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const major = Number.parseInt(process.version.slice(1).split('.')[0], 10);
const root = path.join(__dirname, '..');

if (Number.isNaN(major) || major < 18) {
  console.log(
    `[test] SKIP vitest: Node 18+ 필요 (현재 ${process.version}). CI/로컬에서 Node 20 등으로 \`npm test\`를 다시 실행하세요.`
  );
  process.exit(0);
}

const r = spawnSync('npx', ['vitest', 'run'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env },
});

process.exit(r.status === null ? 1 : r.status);
