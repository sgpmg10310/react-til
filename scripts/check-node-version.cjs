/**
 * Vite 8 / Vitest 3 는 Node 18+ 필요. 구버전이면 친절한 메시지로 종료.
 */
const major = Number.parseInt(process.version.slice(1).split('.')[0], 10);

if (Number.isNaN(major) || major < 18) {
  process.stderr.write(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Node 버전이 너무 낮습니다.
  현재: ${process.version}
  필요: Node.js 18 이상 (권장: 20 — 이 저장소 .nvmrc 참고)

  해결 예시 (nvm 사용 시):
    cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
    nvm install
    nvm use
    npm run dev
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  process.exit(1);
}
