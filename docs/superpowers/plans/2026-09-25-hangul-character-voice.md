# 한글 게임 캐릭터 목소리 + 배경음 OFF 오답 무음 버그 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 한글 게임 1·3·4·5·6의 목소리를 오리지널 캐릭터("신나는 실험 유튜버형") 하나로 통일하고, 배경음 OFF일 때 오답 소리가 안 나는 버그를 고친다.

**Architecture:** 새 공용 모듈 `src/components/hangul/hangulVoice.js`가 Web Speech로 "캐릭터 대사 조각 + 또박또박 단어 조각"을 이어 읽는다. 게임마다 복사된 `playTTS`/`playSound`를 지우고 이 모듈 함수(`sayWord`, `sayCorrect`, `sayWrong`, `sayLine`)를 부른다. `hangulWrongJingle.js`는 배경음 음소거 값을 더 이상 보지 않고, 오답 읽기를 `sayWrong`에 맡긴다.

**Tech Stack:** React 18, Vite 8, Vitest 3 (`environment: 'node'`), Web Speech API

**Spec:** `docs/superpowers/specs/2026-09-25-hangul-character-voice-design.md`

---

## 공통 준비 (모든 작업자)

- 모든 명령 앞에 `export PATH=$HOME/.nvm/versions/node/v20.20.2/bin:$PATH &&` (기본 Node v14는 Vitest를 건너뜀). `node_modules`는 설치돼 있음.
- 작업 폴더: `/Users/myungkeunpark/orca/workspaces/react-til/http-github.com-sgpmg10310-react-til` (브랜치 `sgpmg10310/http-github.com-sgpmg10310-react-til`, `main`과 같은 지점에서 시작)
- 단일 테스트: `npx vitest run <파일이름 일부>`
- 기준선: `npm test` → 3 files, 12 passed. 고친 파일 lint의 기존 경고는 `'React' is defined but never used`(JSX 오탐)뿐이며 고치지 않는다.
- 커밋은 자기 파일만 경로 지정: `git add <files> && git commit -m "<msg>" -- <files>`. `git add -A`/`.`/`stash` 금지.
- 커밋 메시지 끝: `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`
- build는 `npx vite build --outDir <스크래치 폴더> --emptyOutDir` (커밋된 `dist/`를 바꾸지 않기 위해 `npm run build` 금지)

## 파일 구조

| 파일 | 역할 |
|---|---|
| `src/components/hangul/hangulVoice.js` (생성) | 캐릭터 목소리: 목소리 선택, 대사 고르기, 조각 이어 읽기 |
| `src/components/hangul/hangulVoice.test.js` (생성) | 위 모듈 테스트 |
| `src/components/hangul/hangulWrongJingle.js` (수정) | 음소거 검사 제거, 오답 읽기를 `sayWrong`에 위임 |
| `src/components/hangul/hangulWrongJingle.test.js` (수정) | "배경음을 꺼도 읽는다" |
| `src/pages/game1/CombineSoundsGame.jsx` (수정) | `playSound` → `sayWord` |
| `src/pages/game3/PictureMatchGame.jsx` (수정) | `playTTS` → `sayCorrect` |
| `src/pages/game4/LetterToImageGame.jsx` (수정) | `playTTS` → `sayWord`/`sayLine` |
| `src/pages/game5/WhiteboardGame.jsx` (수정) | `playTTS` → `sayLine`, 조사 오류 수정 |
| `qa.md`, `task.md` (수정) | 기록 |

---

### Task 1: 캐릭터 목소리 모듈

**Files:**
- Create: `src/components/hangul/hangulVoice.js`
- Test: `src/components/hangul/hangulVoice.test.js`

- [ ] **Step 1: 실패하는 테스트 작성** — `src/components/hangul/hangulVoice.test.js`

```js
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

  it('한국어 목소리가 없으면 목소리를 지정하지 않는다', () => {
    voices = [{ name: 'Samantha', lang: 'en-US' }];
    sayWord('가');
    expect(spoken[0].voice).toBeUndefined();
  });

  it('speechSynthesis가 없어도 오류 없이 넘어간다', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    expect(() => sayCorrect('곰')).not.toThrow();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run hangulVoice`
Expected: FAIL — `Failed to resolve import "./hangulVoice.js"` 또는 함수 없음

- [ ] **Step 3: 구현** — `src/components/hangul/hangulVoice.js`

```js
/**
 * 한글 게임 공용 목소리 — 오리지널 캐릭터 "신나는 실험 유튜버"
 * (특정 인물을 흉내 내지 않은 목소리)
 * - 감탄사·대사는 CHARACTER 목소리, 배울 글자·단어는 WORD 목소리로 또박또박 읽는다.
 * - 배경음 OFF(hangul-bgm-muted)와 무관하게 항상 읽는다.
 */

export const CHARACTER = { pitch: 1.4, rate: 1.15 };
export const WORD = { pitch: 1.1, rate: 0.95 };

/** [앞말, 뒷말] — 조사를 붙이지 않도록 단어 뒤는 느낌표로 끊는다 */
export const CORRECT_LINES = [
  ['오오오!', '대성공~!'],
  ['대박!', '맞았다!'],
  ['예스!', '천재인데요?'],
];

export const WRONG_LINES = [
  ['어라라?', '아니에요~ 다시 가보자고!'],
  ['어엇!', '아니에요~'],
  ['아쉽다!', '아니에요~'],
];

const PREFERRED_VOICE = /Google|Yuna|Neural|Natural/i;
const lastPickByLines = new Map();

/** 무작위로 고르되 직전에 고른 대사는 피한다 */
function pickLine(lines) {
  let i = Math.floor(Math.random() * lines.length);
  if (lines.length > 1 && i === lastPickByLines.get(lines)) i = (i + 1) % lines.length;
  lastPickByLines.set(lines, i);
  return lines[i];
}

/** 목소리 목록은 늦게 채워질 수 있어 매번 다시 찾는다 */
function pickKoreanVoice(synth) {
  const korean = synth.getVoices().filter((v) => v.lang?.toLowerCase().startsWith('ko'));
  return korean.find((v) => PREFERRED_VOICE.test(v.name)) ?? korean[0] ?? null;
}

/** 이전 읽기를 멈추고 조각들을 순서대로 읽는다 */
function speakParts(parts) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  const voice = pickKoreanVoice(synth);
  synth.cancel();
  for (const { text, style } of parts) {
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.pitch = style.pitch;
    utterance.rate = style.rate;
    if (voice) utterance.voice = voice;
    synth.speak(utterance);
  }
}

/** 글자·단어만 또박또박 */
export function sayWord(text) {
  speakParts([{ text, style: WORD }]);
}

/** 캐릭터 대사 (+ 있으면 또박또박 단어) */
export function sayLine(line, word) {
  const parts = [{ text: line, style: CHARACTER }];
  if (word) parts.push({ text: `${word}!`, style: WORD });
  speakParts(parts);
}

function sayWithLines(lines, word) {
  const [before, after] = pickLine(lines);
  speakParts([
    { text: before, style: CHARACTER },
    { text: `${word}!`, style: WORD },
    { text: after, style: CHARACTER },
  ]);
}

/** 정답: "오오오!" → "호랑이!" → "대성공~!" */
export function sayCorrect(word) {
  sayWithLines(CORRECT_LINES, word);
}

/** 오답: "어라라?" → "사자!" → "아니에요~ 다시 가보자고!" */
export function sayWrong(word) {
  sayWithLines(WRONG_LINES, word);
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run hangulVoice`
Expected: 8 passed
Run: `npx eslint src/components/hangul/hangulVoice.js src/components/hangul/hangulVoice.test.js`
Expected: 출력 없음 (0 errors, 0 warnings)

- [ ] **Step 5: 커밋**

```bash
git add src/components/hangul/hangulVoice.js src/components/hangul/hangulVoice.test.js
git commit -m "feat(hangul): 오리지널 캐릭터 목소리 모듈 hangulVoice 추가

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>" -- src/components/hangul/hangulVoice.js src/components/hangul/hangulVoice.test.js
```

---

### Task 2: 배경음 OFF에도 오답 소리·목소리가 나게 (버그 수정)

**Files:**
- Modify: `src/components/hangul/hangulWrongJingle.js:1-6`, `:53-55`, `:87-107`
- Test: `src/components/hangul/hangulWrongJingle.test.js` (전체 교체)

- [ ] **Step 1: 테스트 전체 교체** — `src/components/hangul/hangulWrongJingle.test.js`

```js
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
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run hangulWrongJingle`
Expected: FAIL 2개 — 첫 테스트(조각 1개만 읽음: `expected length 3, got 1`), "배경음을 꺼도 읽는다"(0개)

- [ ] **Step 3: `hangulWrongJingle.js` 수정**

(a) 파일 맨 위 주석과 `LS_MUTED` 상수(1~6행)를 다음으로 교체:

```js
/**
 * 틀렸을 때 재생하는 짧은 징글 (합성음, 외부 파일 없음)
 * 배경음 OFF와 무관하게 항상 재생한다 (배경음 버튼은 음악만 끈다).
 */

import { sayWrong } from './hangulVoice.js';
```

(b) `playHangulWrongJingle` 안의 다음 한 줄을 삭제:

```js
  if (localStorage.getItem(LS_MUTED) === '1') return;
```

(c) `SAY_AFTER_JINGLE_MS` 아래 JSDoc과 `playWrongJingleThenSay` 전체를 교체:

```js
/**
 * 오답 징글을 울리고, 끝나면 캐릭터 오답 대사로 고른 단어를 읽어 준다.
 * @returns {() => void} 아직 읽기 전이면 읽기를 취소하는 함수
 */
export function playWrongJingleThenSay(word) {
  if (typeof window === 'undefined') return () => {};

  void playHangulWrongJingle();
  const timer = window.setTimeout(() => sayWrong(word), SAY_AFTER_JINGLE_MS);

  return () => window.clearTimeout(timer);
}
```

(d) 확인: `grep -n "LS_MUTED\|localStorage" src/components/hangul/hangulWrongJingle.js` → 출력 없음

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run hangulWrongJingle hangulVoice`
Expected: 12 passed (4 + 8)
Run: `npx eslint src/components/hangul/hangulWrongJingle.js src/components/hangul/hangulWrongJingle.test.js`
Expected: 출력 없음

- [ ] **Step 5: 커밋**

```bash
git add src/components/hangul/hangulWrongJingle.js src/components/hangul/hangulWrongJingle.test.js
git commit -m "fix(hangul): 배경음 OFF여도 오답 소리·목소리가 나게 하고 오답 읽기를 캐릭터 목소리로

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>" -- src/components/hangul/hangulWrongJingle.js src/components/hangul/hangulWrongJingle.test.js
```

---

### Task 3: 1번·3번 게임을 캐릭터 목소리로

**Files:**
- Modify: `src/pages/game1/CombineSoundsGame.jsx:3`, `:64-75`, `:78`, `:132`
- Modify: `src/pages/game3/PictureMatchGame.jsx:3`, `:45-54`, `:64`

컴포넌트 테스트 도구가 없어 lint + diff + 배포 후 사람이 확인한다.

- [ ] **Step 1: game1 import 추가** — 3행 `import { playHangulWrongJingle } ...` 바로 아래:

```jsx
import { sayWord } from '../../components/hangul/hangulVoice.js';
```

- [ ] **Step 2: game1 `playSound` 삭제** — 아래 블록(주석 포함 11줄)을 통째로 지운다:

```jsx
  // 🎵 브라우저 내장 Web Speech API를 활용한 소리 재생 함수
  const playSound = (text) => {
    if (!window.speechSynthesis) return;
    // 이전에 읽고 있던 소리가 있다면 취소
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR'; // 한국어 발음
    utterance.pitch = 1.5;    // 약간 높은 톤으로 귀엽게 연출
    utterance.rate = 1.1;     // 읽는 속도
    window.speechSynthesis.speak(utterance);
  };

```

- [ ] **Step 3: game1 호출 교체**
  - `    playSound(value); // 자음이나 모음 버튼을 누를 때마다 소리를 냅니다.` → `    sayWord(value); // 자음이나 모음 버튼을 누를 때마다 또박또박 읽어 줍니다.`
  - `        playSound(fullText); // 조립 중인 전체 단어를 읽어줍니다.` → `        sayWord(fullText); // 조립 중인 전체 단어를 읽어줍니다.`
  - 확인: `grep -n "playSound\|SpeechSynthesisUtterance" src/pages/game1/CombineSoundsGame.jsx` → 출력 없음

- [ ] **Step 4: game3 import 추가** — `import { playWrongJingleThenSay } ...` 바로 아래:

```jsx
import { sayCorrect } from '../../components/hangul/hangulVoice.js';
```

- [ ] **Step 5: game3 `playTTS` 삭제** — 아래 블록(주석 포함 10줄 + 뒤 빈 줄)을 지운다:

```jsx
  // 🎵 TTS 소리 재생 함수 (pitch로 목소리 높낮이를 조절해 웃기게 만듦)
  const playTTS = (text, pitch = 1.0, rate = 1.0) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.pitch = pitch;
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  };

```

- [ ] **Step 6: game3 정답 호출 교체**
  - `      playTTS(\`${word}! 딩동댕동!\`, 1.5, 1.1); // 정답일 땐 높고 경쾌한 목소리` → `      sayCorrect(word); // 캐릭터 정답 대사 (예: 오오오! 호랑이! 대성공~!)`
  - 확인: `grep -n "playTTS\|SpeechSynthesisUtterance" src/pages/game3/PictureMatchGame.jsx` → 출력 없음

- [ ] **Step 7: lint**

Run: `npx eslint src/pages/game1/CombineSoundsGame.jsx src/pages/game3/PictureMatchGame.jsx --ext jsx`
Expected: 0 errors, 경고는 기존 `'React' is defined but never used` 2개뿐

- [ ] **Step 8: 커밋**

```bash
git add src/pages/game1/CombineSoundsGame.jsx src/pages/game3/PictureMatchGame.jsx
git commit -m "feat(hangul-game1,3): 캐릭터 목소리 적용

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>" -- src/pages/game1/CombineSoundsGame.jsx src/pages/game3/PictureMatchGame.jsx
```

---

### Task 4: 4번·5번 게임을 캐릭터 목소리로

**Files:**
- Modify: `src/pages/game4/LetterToImageGame.jsx:3`, `:45-54`, `:60`, `:68`, `:73`
- Modify: `src/pages/game5/WhiteboardGame.jsx:3`, `:18-26`, `:81`, `:87`, `:94`

- [ ] **Step 1: game4 import 추가** — 3행 `import { playHangulWrongJingle } ...` 바로 아래:

```jsx
import { sayLine, sayWord } from '../../components/hangul/hangulVoice.js';
```

- [ ] **Step 2: game4 `playTTS` 삭제** — 아래 블록(주석 포함 10줄 + 뒤 빈 줄)을 지운다:

```jsx
  // 🎵 브라우저 내장 TTS (목소리 재생)
  const playTTS = (text, pitch = 1.2, rate = 1.1) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.pitch = pitch;
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  };

```

- [ ] **Step 3: game4 호출 교체**
  - `    playTTS(item.char); // 고른 글자 읽어주기` → `    sayWord(item.char); // 고른 글자 또박또박 읽어주기`
  - `    playTTS("얍!", 1.5, 1.5); // 기합 소리!` → `    sayLine('얍!'); // 기합 소리!`
  - `      playTTS(\`${selectedItem.word}!\`, 1.2, 1.0); // 변신한 단어 읽어주기` → `      sayLine('짜잔!', selectedItem.word); // 변신한 단어 읽어주기`
  - 확인: `grep -n "playTTS\|SpeechSynthesisUtterance" src/pages/game4/LetterToImageGame.jsx` → 출력 없음

- [ ] **Step 4: game5 import 추가** — 3행 `import { playHangulWrongJingle } ...` 바로 아래:

```jsx
import { sayLine } from '../../components/hangul/hangulVoice.js';
```

- [ ] **Step 5: game5 `playTTS` 삭제** — 아래 블록(9줄 + 뒤 빈 줄)을 지운다:

```jsx
  const playTTS = (text, pitch = 1.3, rate = 1.1) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.pitch = pitch;
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  };

```

- [ ] **Step 6: game5 호출 교체**
  - `        playTTS('먼저 글자를 써 주세요!', 1.1, 1.05);` → `        sayLine('먼저 글자를 써 주세요!');`
  - `    playTTS('수리수리 마수리... 얍!', 1.5, 1.2);` → `    sayLine('수리수리 마수리... 얍!');`
  - `      playTTS(\`혹시 ${char} 글자를 쓰셨나요? ${randomPick.word} 네요!\`, 1.2, 1.1);` → `      sayLine(\`혹시 ${char} 글자를 쓰셨나요?\`, randomPick.word); // "~네요"는 받침에 따라 틀려서 뺌`
  - 확인: `grep -n "playTTS\|SpeechSynthesisUtterance\|네요" src/pages/game5/WhiteboardGame.jsx` → `네요`가 들어간 주석 1줄만

- [ ] **Step 7: lint**

Run: `npx eslint src/pages/game4/LetterToImageGame.jsx src/pages/game5/WhiteboardGame.jsx --ext jsx`
Expected: 0 errors, 경고는 기존 `'React' is defined but never used` 2개뿐 (작업 전 기준선과 같음)

- [ ] **Step 8: 커밋**

```bash
git add src/pages/game4/LetterToImageGame.jsx src/pages/game5/WhiteboardGame.jsx
git commit -m "feat(hangul-game4,5): 캐릭터 목소리 적용, 5번 조사 오류 수정

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>" -- src/pages/game4/LetterToImageGame.jsx src/pages/game5/WhiteboardGame.jsx
```

---

### Task 5: 전체 검증 · 기록 · 배포 (Claude)

- [ ] **Step 1: 남은 복사본 확인**

Run: `grep -rn "new SpeechSynthesisUtterance\|new window.SpeechSynthesisUtterance" src/pages src/components | grep -v test`
Expected: `src/components/hangul/hangulVoice.js` 한 곳만

- [ ] **Step 2: 전체 테스트**

Run: `npm test`
Expected: 4 files, 20 passed (verifyAppImports 2 + 단어장 6 + 오답 4 + 목소리 8)

- [ ] **Step 3: lint (고친 파일)**

Run: `npx eslint src/components/hangul src/pages/game1 src/pages/game3 src/pages/game4 src/pages/game5 src/pages/game6 --ext js,jsx -f unix`
Expected: 0 errors, 경고는 `'React'`/`Outlet`/`HangulGameBgm` JSX 오탐뿐

- [ ] **Step 4: build**

Run: `npx vite build --outDir <스크래치>/dist-voice --emptyOutDir`
Expected: `✓ built`

- [ ] **Step 5: 코드 리뷰 서브에이전트** — `git diff aaddbe1..HEAD` 범위, Critical/Important 없을 때까지 수정

- [ ] **Step 6: `task.md`, `qa.md` 끝에 기록 추가 후 커밋** (증상·원인·수정·검증 결과, 배포 후 사람 확인 항목)

- [ ] **Step 7: `main`에 fast-forward 병합 후 푸시, 배포 워크플로우 확인**

```bash
git -C /Users/myungkeunpark/orca/react-til merge --ff-only sgpmg10310/http-github.com-sgpmg10310-react-til
git -C /Users/myungkeunpark/orca/react-til push origin main
gh run list --workflow deploy.yml --limit 1   # 새 run id 확인
gh run watch <run-id> --repo sgpmg10310/react-til --exit-status
```

배포된 JS에 `다시 가보자고` 문자열이 있는지 확인:

```bash
URL=https://sgpmg10310.github.io/react-til/
JS=$(curl -sL "$URL" | grep -o 'assets/index-[^"]*\.js' | head -1)
curl -sL "$URL$JS" | grep -c '다시 가보자고'
```
Expected: 1 이상
