import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WRONG_LINES } from './hangulVoice.js';
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
    getVoices: () => [],
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('playWrongJingleThenSay', () => {
  it('징글이 끝난 1.1초 뒤 캐릭터 오답 대사로 고른 단어를 읽는다', () => {
    playWrongJingleThenSay('사자');
    vi.advanceTimersByTime(1099);
    expect(spoken).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(spoken).toHaveLength(3);
    expect(spoken[1].text).toBe('사자!');
    expect(WRONG_LINES).toContainEqual([spoken[0].text, spoken[2].text]);
  });

  it('취소 함수를 부르면 읽지 않는다', () => {
    const cancel = playWrongJingleThenSay('사자');
    cancel();
    vi.advanceTimersByTime(2000);
    expect(spoken).toHaveLength(0);
  });

  it('배경음을 꺼도(hangul-bgm-muted=1) 읽는다', () => {
    store['hangul-bgm-muted'] = '1';
    playWrongJingleThenSay('사자');
    vi.advanceTimersByTime(1100);
    expect(spoken).toHaveLength(3);
  });

  it('speechSynthesis가 없어도 오류 없이 넘어간다', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    playWrongJingleThenSay('사자');
    expect(() => vi.advanceTimersByTime(2000)).not.toThrow();
  });
});
