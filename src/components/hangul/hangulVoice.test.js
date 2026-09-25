import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CHARACTER,
  CORRECT_LINES,
  WORD,
  WRONG_LINES,
  sayCorrect,
  sayLine,
  sayWord,
  sayWrong,
  stopVoice,
} from './hangulVoice.js';

let spoken;
let voices;
let cancel;

beforeEach(() => {
  spoken = [];
  voices = [];
  cancel = vi.fn(() => {
    spoken.length = 0;
  });
  // Vitest 환경은 node라서 브라우저 전역을 가짜로 만든다.
  vi.stubGlobal('window', globalThis);
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      constructor(text) {
        this.text = text;
      }
    },
  );
  vi.stubGlobal('speechSynthesis', {
    cancel,
    speak: (u) => spoken.push(u),
    getVoices: () => voices,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const styleOf = (u) => ({ pitch: u.pitch, rate: u.rate });

describe('hangulVoice', () => {
  it('sayCorrect: 캐릭터 앞말 → 또박또박 단어 → 캐릭터 뒷말', () => {
    sayCorrect('호랑이');
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(spoken).toHaveLength(3);
    const [before, word, after] = spoken;
    expect(word.text).toBe('호랑이!');
    expect(styleOf(word)).toEqual(WORD);
    expect(styleOf(before)).toEqual(CHARACTER);
    expect(styleOf(after)).toEqual(CHARACTER);
    expect(CORRECT_LINES).toContainEqual([before.text, after.text]);
    expect(spoken.every((u) => u.lang === 'ko-KR')).toBe(true);
  });

  it('sayWrong: 오답 대사 중 하나로 읽는다', () => {
    sayWrong('사자');
    expect(spoken).toHaveLength(3);
    expect(spoken[1].text).toBe('사자!');
    expect(WRONG_LINES).toContainEqual([spoken[0].text, spoken[2].text]);
  });

  it('같은 대사를 두 번 연달아 쓰지 않는다', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    sayCorrect('곰');
    const first = spoken[0].text;
    sayCorrect('곰');
    expect(spoken[0].text).not.toBe(first);
  });

  it('sayWord: 글자만 또박또박 한 조각', () => {
    sayWord('가');
    expect(spoken).toHaveLength(1);
    expect(spoken[0].text).toBe('가');
    expect(styleOf(spoken[0])).toEqual(WORD);
  });

  it('sayLine: 대사만, 또는 대사 + 또박또박 단어', () => {
    sayLine('얍!');
    expect(spoken).toHaveLength(1);
    expect(spoken[0].text).toBe('얍!');
    expect(styleOf(spoken[0])).toEqual(CHARACTER);

    sayLine('짜잔!', '곰');
    expect(spoken).toHaveLength(2);
    expect(spoken[1].text).toBe('곰!');
    expect(styleOf(spoken[1])).toEqual(WORD);
  });

  it('한국어 목소리 중 자연스러운 목소리를 고른다', () => {
    const yuna = { name: 'Yuna', lang: 'ko-KR' };
    voices = [
      { name: 'Samantha', lang: 'en-US' },
      yuna,
      { name: 'Other', lang: 'ko-KR' },
    ];
    sayWord('가');
    expect(spoken[0].voice).toBe(yuna);
  });

  it('인터넷이 필요한 목소리보다 컴퓨터에 설치된 한국어 목소리를 먼저 고른다', () => {
    const local = { name: 'Yuna', lang: 'ko-KR', localService: true };
    voices = [
      { name: 'Google 한국의', lang: 'ko-KR', localService: false },
      { name: 'Other', lang: 'ko-KR', localService: true },
      local,
    ];
    sayWord('가');
    expect(spoken[0].voice).toBe(local);
  });

  it('한국어 목소리가 없으면 목소리를 지정하지 않는다', () => {
    voices = [{ name: 'Samantha', lang: 'en-US' }];
    sayWord('가');
    expect(spoken[0].voice).toBeUndefined();
  });

  it('stopVoice: 읽던 목소리를 멈춘다', () => {
    sayCorrect('곰');
    stopVoice();
    expect(cancel).toHaveBeenCalledTimes(2);
    expect(spoken).toHaveLength(0);
  });

  it('speechSynthesis가 없어도 오류 없이 넘어간다', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    expect(() => sayCorrect('곰')).not.toThrow();
    expect(() => stopVoice()).not.toThrow();
  });
});
