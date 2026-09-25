// 학습용 코드 실행기: 사용자가 쓴 JS를 실행하고 console.log 출력을 모아서 돌려줍니다.
// 사용자 자신의 브라우저에서 자기 코드를 돌리는 용도라 별도 샌드박스는 두지 않습니다.

export function formatValue(value) {
  if (typeof value === 'string') return value;
  if (value === undefined) return 'undefined';
  if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/**
 * @param {string} code 실행할 JS 코드
 * @param {Record<string, unknown>} scope 코드 안에서 이름으로 쓸 값들 (예: { produce })
 * @returns {{ logs: string[], error: string | null }}
 */
export function runCode(code, scope = {}) {
  const logs = [];
  const push = (prefix) => (...args) => logs.push(prefix + args.map(formatValue).join(' '));
  const fakeConsole = { log: push(''), info: push(''), warn: push('⚠️ '), error: push('❌ ') };

  try {
    const fn = new Function(...Object.keys(scope), 'console', `"use strict";\n${code}`);
    fn(...Object.values(scope), fakeConsole);
    return { logs, error: null };
  } catch (e) {
    return { logs, error: e instanceof Error ? e.message : String(e) };
  }
}
