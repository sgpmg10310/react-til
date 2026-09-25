import { describe, it, expect } from 'vitest';
import { affectedPackages, buildOrder, tokenize } from './studyLogic.js';

const deps = {
  web: ['ui', 'api-client'],
  mobile: ['ui', 'api-client'],
  admin: ['ui'],
  ui: ['utils'],
  'api-client': ['utils'],
  utils: [],
};

describe('affectedPackages (모노레포 영향 분석)', () => {
  it('맨 아래 utils를 고치면 모두 영향을 받는다', () => {
    expect(affectedPackages(deps, 'utils').sort()).toEqual(
      ['admin', 'api-client', 'mobile', 'ui', 'utils', 'web'],
    );
  });

  it('api-client를 고치면 admin은 영향이 없다', () => {
    expect(affectedPackages(deps, 'api-client').sort()).toEqual(['api-client', 'mobile', 'web']);
  });

  it('앱(web)을 고치면 자기 자신만 영향 받는다', () => {
    expect(affectedPackages(deps, 'web')).toEqual(['web']);
  });
});

describe('buildOrder (빌드 순서)', () => {
  it('의존하는 패키지를 항상 먼저 빌드한다', () => {
    const order = buildOrder(deps, Object.keys(deps));
    Object.entries(deps).forEach(([pkg, list]) => {
      list.forEach((dep) => {
        expect(order.indexOf(dep)).toBeLessThan(order.indexOf(pkg));
      });
    });
    expect(order).toHaveLength(6);
  });

  it('대상에 없는 패키지는 순서에 넣지 않는다', () => {
    expect(buildOrder(deps, ['web', 'api-client'])).toEqual(['api-client', 'web']);
  });
});

describe('tokenize (SWC 1단계: 글자를 토큰으로 자르기)', () => {
  it('간단한 코드를 종류별 토큰으로 자른다', () => {
    expect(tokenize('const a = 1 + 2;')).toEqual([
      { type: 'keyword', value: 'const' },
      { type: 'identifier', value: 'a' },
      { type: 'punctuator', value: '=' },
      { type: 'number', value: '1' },
      { type: 'punctuator', value: '+' },
      { type: 'number', value: '2' },
      { type: 'punctuator', value: ';' },
    ]);
  });

  it('문자열과 화살표(=>)를 한 덩어리로 본다', () => {
    expect(tokenize("let f = () => 'hi'")).toEqual([
      { type: 'keyword', value: 'let' },
      { type: 'identifier', value: 'f' },
      { type: 'punctuator', value: '=' },
      { type: 'punctuator', value: '(' },
      { type: 'punctuator', value: ')' },
      { type: 'punctuator', value: '=>' },
      { type: 'string', value: "'hi'" },
    ]);
  });

  it('모르는 글자는 unknown으로 표시한다', () => {
    expect(tokenize('#')).toEqual([{ type: 'unknown', value: '#' }]);
  });
});
