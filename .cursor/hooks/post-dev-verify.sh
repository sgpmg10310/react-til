#!/usr/bin/env bash
# 에이전트 응답 종료(stop) 시: App.jsx import 경로 검증 + Vitest + ESLint + node 구문 검사
cat >/dev/null 2>&1 || true

set +e
HOOKS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$HOOKS_DIR/../.." && pwd)"
cd "$REPO_ROOT" || exit 0

mkdir -p "$REPO_ROOT/.cursor"
LOG="$REPO_ROOT/.cursor/last-verify.log"

exec > >(tee "$LOG") 2>&1

echo "=== post-dev-verify $(date -u +"%Y-%m-%dT%H:%M:%SZ") ==="
echo "REPO_ROOT=$REPO_ROOT"
echo "--- node ---"
command -v node >/dev/null && node -v || echo "node not found"

echo ""
echo "--- 1) App.jsx ↔ 컴포넌트 상대 경로 (verify:app-imports) ---"
npm run verify:app-imports
E1=$?

echo ""
echo "--- 2) 단위 테스트 (vitest run) ---"
npm test
E2=$?

echo ""
echo "--- 3) ESLint (문법·규칙, Node 18+ 권장) ---"
npm run lint
E3=$?

echo ""
echo "--- 4) node --check (검증 스크립트 구문) ---"
node --check "$REPO_ROOT/scripts/verify-app-imports.cjs"
E4=$?

echo ""
echo "=== 요약 exit code: imports=$E1 vitest=$E2 eslint=$E3 node_check=$E4 ==="
if [ "$E1" -ne 0 ] || [ "$E2" -ne 0 ] || [ "$E4" -ne 0 ]; then
  echo "[특이사항] imports·테스트·node --check 중 하나 이상 실패. 위 로그 확인."
fi
if [ "$E3" -ne 0 ]; then
  echo "[특이사항] ESLint 실패: 로컬 Node 버전(18+)과 eslint 설정을 확인하세요."
fi

# 훅은 에이전트 흐름을 막지 않도록 항상 0 (fail open)
printf '%s\n' "{\"followup_message\": \"react-til post-dev-verify 완료. imports=$E1 vitest=$E2 eslint=$E3 node_check=$E4. 상세: .cursor/last-verify.log\"}"
exit 0
