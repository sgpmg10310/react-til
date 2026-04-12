import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const testFileDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testFileDir, '..');

describe('프로젝트 건강 검사', () => {
  it('App.jsx 상대 import 경로가 실제 파일과 일치한다', () => {
    expect(() => {
      execSync('node scripts/verify-app-imports.cjs', {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: 'pipe',
      });
    }).not.toThrow();
  });

  it('메인 엔트리(main.jsx)가 존재한다', () => {
    const main = path.join(repoRoot, 'src', 'main.jsx');
    expect(fs.existsSync(main)).toBe(true);
  });
});
