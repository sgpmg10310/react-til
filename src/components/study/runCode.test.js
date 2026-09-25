import { describe, it, expect } from 'vitest';
import { runCode, formatValue } from './runCode.js';

describe('runCode', () => {
  it('console.log 출력을 줄 단위로 모은다', () => {
    const result = runCode('console.log("안녕", 1 + 2);\nconsole.log([1, 2]);');
    expect(result.error).toBeNull();
    expect(result.logs).toEqual(['안녕 3', '[1,2]']);
  });

  it('scope로 넘긴 값을 코드 안에서 이름으로 쓸 수 있다', () => {
    const double = (n) => n * 2;
    const result = runCode('console.log(double(21));', { double });
    expect(result.logs).toEqual(['42']);
  });

  it('에러가 나면 에러 메시지와 그 전까지의 출력을 돌려준다', () => {
    const result = runCode('console.log("before");\nnotDefinedFn();');
    expect(result.logs).toEqual(['before']);
    expect(result.error).toMatch(/notDefinedFn/);
  });

  it('문법 오류도 에러로 돌려준다', () => {
    const result = runCode('const = ;');
    expect(result.logs).toEqual([]);
    expect(result.error).toBeTruthy();
  });

  it('strict 모드라서 선언 없는 변수 대입은 에러다', () => {
    const result = runCode('oops = 1;');
    expect(result.error).toBeTruthy();
  });
});

describe('formatValue', () => {
  it('값 종류별로 읽기 쉬운 글자로 바꾼다', () => {
    expect(formatValue('abc')).toBe('abc');
    expect(formatValue(undefined)).toBe('undefined');
    expect(formatValue(null)).toBe('null');
    expect(formatValue({ a: 1 })).toBe('{"a":1}');
    expect(formatValue(function hello() {})).toBe('[Function hello]');
  });

  it('순환 참조 객체도 죽지 않는다', () => {
    const obj = {};
    obj.self = obj;
    expect(typeof formatValue(obj)).toBe('string');
  });
});
