// 학습 페이지의 시뮬레이터가 쓰는 순수 로직 (화면과 분리해서 테스트합니다).

/**
 * 모노레포: 패키지 하나를 고쳤을 때 다시 빌드/테스트해야 하는 패키지 목록.
 * deps는 { 패키지: [내가 의존하는 패키지들] } 모양입니다.
 */
export function affectedPackages(deps, changed) {
  const result = new Set([changed]);
  let grew = true;
  while (grew) {
    grew = false;
    Object.entries(deps).forEach(([pkg, list]) => {
      if (!result.has(pkg) && list.some((dep) => result.has(dep))) {
        result.add(pkg);
        grew = true;
      }
    });
  }
  return [...result];
}

/** 모노레포: targets를 "의존하는 것 먼저" 순서로 정렬 (위상 정렬). */
export function buildOrder(deps, targets) {
  const wanted = new Set(targets);
  const visited = new Set();
  const order = [];
  const visit = (pkg) => {
    if (visited.has(pkg)) return;
    visited.add(pkg);
    (deps[pkg] || []).forEach(visit);
    if (wanted.has(pkg)) order.push(pkg);
  };
  targets.forEach(visit);
  return order;
}

const KEYWORDS = new Set(['const', 'let', 'var', 'function', 'return', 'if', 'else', 'import', 'export', 'from', 'new', 'class']);
const TOKEN_RE = /\s*(?:(=>|===|[{}()[\];,.=+\-*/<>!?:])|(\d+(?:\.\d+)?)|('[^']*'|"[^"]*")|([A-Za-z_$][\w$]*)|(\S))/y;

/** SWC 1단계(Parse)의 첫걸음: 코드 글자를 의미 있는 조각(토큰)으로 자릅니다. 학습용 단순 버전. */
export function tokenize(code) {
  const tokens = [];
  TOKEN_RE.lastIndex = 0;
  let m;
  while (TOKEN_RE.lastIndex < code.length && (m = TOKEN_RE.exec(code))) {
    const [, punct, num, str, word, unknown] = m;
    if (punct) tokens.push({ type: 'punctuator', value: punct });
    else if (num) tokens.push({ type: 'number', value: num });
    else if (str) tokens.push({ type: 'string', value: str });
    else if (word) tokens.push({ type: KEYWORDS.has(word) ? 'keyword' : 'identifier', value: word });
    else if (unknown) tokens.push({ type: 'unknown', value: unknown });
    else break; // 끝의 공백만 남은 경우
  }
  return tokens;
}
