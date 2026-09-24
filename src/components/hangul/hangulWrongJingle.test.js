import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { playWrongJingleThenSay } from './hangulWrongJingle.js';

let spoken;
let store;

beforeEach(() => {
  vi.useFakeTimers();
  spoken = [];
  store = {};
  // Vitest 환경은 node라서 브라우저 전역을 가짜로 만든다.
  // AudioContext가 없으므로 징글은 조용히 건너뛴다.
  vi.stubGlobal('window', globalThis);
  vi.stubGlobal('localStorage', { getItem: (k) => store[k] ?? null });
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      constructor(text) {
        this.text = text;
      }
    },
  );
  vi.stubGlobal('speechSynthesis', {
    cancel: vi.fn(),
    speak: (u) => spoken.push(u),
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('playWrongJingleThenSay', () => {
  it('징글이 끝난 1.1초 뒤 고른 단어를 한국어로 읽는다', () => {
    playWrongJingleThenSay('사자');
    vi.advanceTimersByTime(1099);
    expect(spoken).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(spoken).toHaveLength(1);
    expect(spoken[0].text).toBe('사자! 아니에요~');
    expect(spoken[0].lang).toBe('ko-KR');
  });

  it('취소 함수를 부르면 읽지 않는다', () => {
    const cancel = playWrongJingleThenSay('사자');
    cancel();
    vi.advanceTimersByTime(2000);
    expect(spoken).toHaveLength(0);
  });

  it('음소거면 읽지 않는다', () => {
    store['hangul-bgm-muted'] = '1';
    playWrongJingleThenSay('사자');
    vi.advanceTimersByTime(2000);
    expect(spoken).toHaveLength(0);
  });

  it('speechSynthesis가 없어도 오류 없이 넘어간다', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    playWrongJingleThenSay('사자');
    expect(() => vi.advanceTimersByTime(2000)).not.toThrow();
  });
});
