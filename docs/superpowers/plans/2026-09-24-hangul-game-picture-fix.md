# 한글 게임 그림-단어 불일치 해결 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 한글 게임에서 그림을 보면 답이 딱 하나가 되게 하고, 3·6번에서 틀리면 고른 단어를 읽어 주며, 1번에서 무작위 그림을 없앤다.

**Architecture:** 공용 단어장(`src/data/hangulMassWordBank.js` + JSON)을 "그림 1개 = 단어 1개"로 정리하고 테스트로 고정한다. 오답 소리 + 읽기는 `hangulWrongJingle.js`의 새 함수 하나로 모아 3·6번이 같이 쓴다. Task 1(데이터)은 Codex 세션, Task 2~5(코드)는 Claude 세션이 동시에 진행한다. 두 쪽은 파일이 겹치지 않는다.

**Tech Stack:** React 18, Vite 8, Vitest 3 (`environment: 'node'`), Web Speech API, Web Audio API

**Spec:** `docs/superpowers/specs/2026-09-24-hangul-game-picture-fix-design.md`

---

## 공통 준비 (모든 작업자)

이 컴퓨터의 기본 Node는 v14라서 Vitest가 건너뛰어진다. **모든 명령 앞에 Node 20 경로를 붙인다:**

```bash
export PATH=$HOME/.nvm/versions/node/v20.20.2/bin:$PATH
node -v   # v20.20.2
```

`node_modules`가 없으면 `npm ci --no-audit --no-fund`.

작업 전 기준선 (2026-09-24 확인):
- `npm test` → 2 passed
- `npm run lint` → **이미 실패** (61 errors, 141 warnings). 고친 파일만 따로 검사한다.
- 고친 파일 주변의 기존 경고 7개: `'React' is defined but never used` 5개(`HangulGameBgm.jsx`, `HangulGamesLayout.jsx`, game1·3·6), `HangulGamesLayout.jsx`의 `Outlet`·`HangulGameBgm` 미사용 2개 — 모두 JSX 오탐이며 이번에 고치지 않는다.
- build는 커밋된 `dist/`를 바꾸지 않도록 `npx vite build --outDir /tmp/<임의폴더>`로 확인한다. `npm run build`를 쓰지 않는다.

## 파일 구조

| 파일 | 담당 | 역할 |
|---|---|---|
| `src/data/hangulMassWordBank.js` (수정) | Codex | 단어→그림 원본 문자열, 조회 함수. 무작위 그림 제거 |
| `src/data/elementaryPictureExtra.json` (수정) | Codex | 초등 생활 단어 추가분 |
| `src/data/hangulMassWordBank.test.js` (생성) | Codex | 그림 중복·단어 중복 재발 방지 |
| `src/components/hangul/hangulWrongJingle.js` (수정) | Claude | `playWrongJingleThenSay(word)` 추가 |
| `src/components/hangul/hangulWrongJingle.test.js` (생성) | Claude | 읽기 타이밍·취소·음소거 테스트 |
| `src/pages/game1/CombineSoundsGame.jsx` (수정) | Claude | 사전 단어만 그림 표시 |
| `src/pages/game3/PictureMatchGame.jsx` (수정) | Claude | 오답 읽기, 정답 후 잠금 |
| `src/pages/game6/PoopDodgeGame.jsx` (수정) | Claude | 오답 읽기 |
| `qa.md`, `task.md` (수정) | Claude | 변경 기록 (AGENTS.md 규칙) |

---

### Task 1: 단어장 정리 (Codex 세션 — `/orchestration`으로 보냄)

**Files:**
- Modify: `src/data/hangulMassWordBank.js`
- Modify: `src/data/elementaryPictureExtra.json`
- Create: `src/data/hangulMassWordBank.test.js`

**이 작업자는 위 3개 파일 외에는 수정하지 않는다.**

- [ ] **Step 1: 실패하는 테스트 작성**

`src/data/hangulMassWordBank.test.js`:

```js
import { describe, expect, it } from 'vitest';
import {
  getEmojiForWord,
  getKoreanWordBank,
  getRawWordPairsForTest,
} from './hangulMassWordBank.js';

describe('한글 게임 단어장', () => {
  it('그림 하나에는 단어 하나만 붙는다', () => {
    const byEmoji = {};
    for (const { word, emoji } of getKoreanWordBank()) {
      byEmoji[emoji] = byEmoji[emoji] || [];
      byEmoji[emoji].push(word);
    }
    const shared = Object.entries(byEmoji)
      .filter(([, words]) => words.length > 1)
      .map(([emoji, words]) => `${emoji} ${words.join(',')}`);
    expect(shared).toEqual([]);
  });

  it('원본 목록(HAND 문자열 + JSON)에 같은 단어가 두 번 나오지 않는다', () => {
    const counts = {};
    for (const [word] of getRawWordPairsForTest()) {
      counts[word] = (counts[word] || 0) + 1;
    }
    expect(Object.keys(counts).filter((w) => counts[w] > 1)).toEqual([]);
  });

  it('모든 단어는 한글 1~8자이고 그림이 있다', () => {
    const bad = getKoreanWordBank().filter(
      ({ word, emoji }) => !/^[가-힣]{1,8}$/u.test(word) || !emoji,
    );
    expect(bad).toEqual([]);
  });

  it('사전에 없는 말은 그림이 없고, 있는 말은 맞는 그림이 나온다', () => {
    expect(getEmojiForWord('없는말')).toBeNull();
    expect(getEmojiForWord('')).toBeNull();
    expect(getEmojiForWord('고양이')).toBe('🐱');
    expect(getEmojiForWord('배')).toBe('🍐');
    expect(getEmojiForWord('밤')).toBe('🌰');
  });

  it('게임4가 첫 글자가 서로 다른 단어 8개를 뽑을 수 있다', () => {
    const firstChars = new Set(getKoreanWordBank().map(({ word }) => word.charAt(0)));
    expect(firstChars.size).toBeGreaterThanOrEqual(8);
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `npx vitest run hangulMassWordBank` (Node 20 PATH 적용, 프로젝트 루트. 인자는 파일 이름 일부로 거르는 필터)
Expected: FAIL — `getRawWordPairsForTest is not a function` 등

- [ ] **Step 3: `hangulMassWordBank.js` 코드 수정**

1. 파일 맨 위 주석 6번째 줄 `게임1에서 ... 해시 폴백을 씁니다.`를 다음으로 바꾼다:
   ` * - 사전에 없는 말은 getEmojiForWord가 null을 돌려줍니다(무작위 그림 없음).`
2. `FALLBACK_EMOJIS` 배열과 `hashEmoji` 함수를 삭제한다.
3. `getEmojiForWord`를 다음으로 바꾼다 (위 JSDoc도 교체):

```js
/**
 * 단어 → 이모지. 사전에 없으면 null (무작위 그림을 만들지 않음)
 */
export function getEmojiForWord(word) {
  if (!word) return null;
  return WORD_TO_EMOJI[word] ?? null;
}
```

4. JSON 필터의 길이 검사 `/^[가-힣]{2,8}$/u`를 `/^[가-힣]{1,8}$/u`로 바꾼다.
5. `parseHandMap` 바로 위에 원본 파서를 두고 `parseHandMap`이 그것을 쓰게 한 뒤, 테스트용 함수를 파일 끝에 추가한다:

```js
/** HAND 문자열 → [단어, 이모지][] (중복 포함, 원본 그대로) */
function parseHandPairs() {
  return HAND_PAIRS_STRING.trim()
    .split(/\s+/)
    .map((item) => item.match(/^([가-힣]+)(.*)$/u))
    .filter(Boolean)
    .map((m) => [m[1], m[2] || '✨']);
}

function parseHandMap() {
  const map = {};
  for (const [word, emoji] of parseHandPairs()) map[word] = emoji;
  return map;
}
```

```js
/** 테스트용: HAND 문자열 + JSON 원본 [단어, 이모지][] (중복 포함) */
export function getRawWordPairsForTest() {
  const fromJson = elementaryExtra
    .filter((row) => row && typeof row.word === 'string')
    .map((row) => [row.word, row.emoji]);
  return [...parseHandPairs(), ...fromJson];
}
```

- [ ] **Step 4: 데이터 정리 — 아래 결정표를 그대로 적용**

규칙: ① 그림 하나에 단어 하나 ② 단어는 한 번만 ③ 그림이 뜻과 맞아야 함 ④ 초등 저학년이 아는 단어만.
"삭제"는 `HAND_PAIRS_STRING`이나 JSON에서 그 항목을 지운다. "변경"은 그림만 바꾼다. "추가"는 `HAND_PAIRS_STRING`에 넣는다.

**A. 두 번 들어간 단어 (앞/뒤 중 하나만 남김)**

| 단어 | 남길 그림 |
|---|---|
| 배 | 🍐 (🚢 항목 삭제) |
| 밤 | 🌰 (🌃 항목 삭제) |
| 모자 | 🧢 (👒 항목 삭제) |
| 신발 | 👟 (👞 항목 삭제) |
| 우산 | ☂️ (☔ 항목 삭제) |
| 시계, 우유, 과자, 피자, 문어, 오징어, 오리, 닭 | 같은 그림이 두 번 — 두 번째 항목 삭제 |

**B. 같은 그림 묶음 → 대표 단어만**

| 그림 | 남길 단어 (그림 변경 시 표기) | 삭제 |
|---|---|---|
| 🐕 | (없음 — 강아지🐶가 이미 있음) | 허스키, 리트리버, 진돗개, 풍산개, 비글, 닥스훈트, 웰시코기, 시바견, 도베르만, 보더콜리, 사모예드, 골든리트리버, 요크셔테리어, 치와와, 포메라니안, 불독, 프렌치불독, 썰매개 |
| 🐩 | (없음) | 말티즈, 푸들 |
| 🐦 | 새 | 조류, 참새, 까치, 까마귀, 제비, 꿩, 타조 |
| 🕊️ | 비둘기 (🐦 → 🕊️로 변경) | 두루미, 학 |
| 🍲 | 찌개 | 스프, 전골, 샤브샤브, 훠궈, 마라탕, 떡국, 냄비 |
| 🍗 | 치킨 | 닭고기, 튀김닭, 양념치킨, 간장치킨, 꿩고기 |
| 🐟 | 물고기 | 생선, 연어, 참치, 고등어 |
| 🧊 | 얼음 | 북극, 빙하, 냉장고 |
| 🧱 | 벽돌 | 레고, 블록, 시멘트 |
| 🥟 | 만두 | 전, 완자, 교자 |
| 🍚 | 밥 (추가) | 리조또, 덮밥, 비빔밥, 볶음밥 |
| 🎒 | 가방 | 책가방, 입학 |
| 🌙 | 달 | 달빛, 달탐사 |
| 🚪 | 문 | 문패, 복도 |
| 🐙 | 문어 | 낙지, 주꾸미 |
| ✏️ | 연필 | 분필, 연필통 |
| 🖼️ | 그림 | 미술, 사진 |
| 🖍️ | 크레파스 | 색연필, 크레용 |
| 🗺️ | 지도 | 나라, 지도책 |
| 🧥 | 코트 | 패딩, 후드 |
| 🥬 | 배추 | 김치, 상추 |
| 🍦 | 아이스크림 (🍧 → 🍦로 변경) | 요거트, 아이스 |
| 🍧 | 빙수 | 팥빙수 |
| 🦀 | 게 | 대게, 꽃게 |
| 🪟 | 창문 | 커튼 |
| 🪞 | 거울 (🪟 → 🪞로 변경) | — |
| ⚽ | 공 | 체육 |
| 🍪 | 과자 | 쿠키 |
| 🎤 | 마이크 | 노래 |
| 🥕 | 당근 | 무 |
| 🔥 | 불 | 모닥불 |
| 🫘 | 콩 | 된장 |
| ✈️ | 비행기 | 여행 |
| 🎁 | 선물 | 기념품 |
| 🪑 | 의자 | 식탁 |
| 🏫 | 학교 | 교실 |
| ☁️ | 구름 | 하늘 |
| 🌳 | 나무 | 공원 |
| 🚇 | 지하철 | 터널 |
| 🛝 | 미끄럼틀 | 놀이터 |
| 📖 | 이야기 | 수업 |
| 🚒 | 소방차 | 소방서 |
| 📮 | 우체통 (추가) | 우체국, 우표 |
| ✉️ | 편지 | 봉투 |
| 🏪 | 편의점 | 가게 |
| 🏬 | 백화점 (추가) | 시장, 슈퍼 |
| 🏦 | 은행 | 금고 |
| 🔔 | 종 (추가) | 초인종, 벨 |
| 💡 | 전구 | 조명 |
| 🧭 | 나침반 | 컴퍼스 |
| 📝 | (없음) | 연습장, 시험 |
| 📚 | 도서관 | 숙제 |
| ⛺ | 텐트 | 캠핑 |
| ☀️ | 해 (추가) | 햇빛, 태양 |
| 🏊 | 수영 | 수영장 |
| 💎 | 보석 (💠 → 💎로 변경) | 다이아, 귀걸이 |
| 📿 | 목걸이 | 팔찌 |
| 👖 | 바지 | 청바지 |
| 👢 | 장화 (🥾 → 👢로 변경) | 등산 |
| 🧣 | 목도리 (추가) | 스카프, 수건 |
| 👗 | 드레스 | 치마 |
| 🎓 | 졸업 | 교복 |
| 🍱 | 도시락 | 급식 |
| 🍜 | 라면 | 국수 |
| 🍢 | 어묵 (추가) | 떡볶이, 순대 |
| 🫙 | (없음) | 참기름, 식초 |
| 🍬 | 사탕 (🍭 → 🍬로 변경) | 설탕, 젤리 |
| 🍭 | 막대사탕 | — |
| 🥗 | 샐러드 | 잡채 |
| 🌭 | 핫도그 | 소시지 |
| 🦪 | 굴 | — |
| 🐚 | 조개 (🦪 → 🐚로 변경) | 전복 |
| 🪸 | 산호 | 멍게 |
| 🦉 | 부엉이 | 올빼미 |
| 🦢 | 백조 | 거위 |
| 🐧 | 펭귄 | 남극 |
| 🧴 | (없음) | 물통, 치약 |
| 🧺 | 바구니 (추가) | 세탁기, 세탁소 |
| 🛏️ | 침대 (🛌 → 🛏️로 변경) | 이불, 베개 |
| 🐆 | 표범 | 치타 |
| 🌰 | 밤 | 도토리 |

**C. 그림이 뜻과 다른 단어**

| 처리 | 단어 |
|---|---|
| 그림 변경 | 비 → 🌧️, 성 → 🏰, 영화 → 🎬, 새우 → 🦐, 빨래 → 티셔츠👕 (단어도 변경), 욕실 → 샤워🚿 (단어도 변경), 스포트라이트 → 손전등🔦 (단어도 변경), 잔디 → 새싹🌱 (단어도 변경), 지붕 → 집🏠 (단어도 변경), 계단 → 사다리🪜 (단어도 변경), 항구 → 닻⚓ (단어도 변경), 고추장 → 고추🌶️ (단어도 변경), 스테이크 → 고기🥩 (단어도 변경), 지구본 → 지구🌍 (단어도 변경), 김밥 → 주먹밥🍙 (단어도 변경), 카약 → 카누🛶 (단어도 변경), 위성 → 인공위성🛰️ (단어도 변경), 침팬지 → 오랑우탄🦧 (단어도 변경), 메론 → 멜론🍈 (맞춤법) |
| 삭제 | 구름비, 모래성, 모래, 칠판, 자두, 등대, 운동장, 횡단보도, 테이프, 지우개, 꿈, 시간, 아침, 저녁, 친구, 미로, 시소, 그네, 암호, 보물, 무대, 동영상, 화면, 돈가방, 점수, 상장, 별자리, 눈싸움, 물놀이, 우주, 유성, 호떡, 부침개, 삼겹살, 한복, 교과서, 빵집, 기차역, 비행장, 바둑, 스위치, 잠수함 |

- [ ] **Step 5: 테스트 통과 확인**

Run: `npx vitest run hangulMassWordBank`
Expected: 5 passed. 실패 메시지에 `🐱 고양이,xxx`처럼 남은 묶음이 보이면, 규칙 ①~④로 대표 단어 하나만 남기고 무엇을 결정했는지 커밋 메시지에 적는다.

- [ ] **Step 6: 남은 단어 목록 뽑아서 한 번 더 눈으로 검토**

JSON import 때문에 plain `node`로는 못 읽으니, 커밋하지 않을 임시 테스트로 출력한다:

```bash
cat > src/data/zz-dump.test.js <<'JS'
import { it } from 'vitest';
import { getKoreanWordBank } from './hangulMassWordBank.js';
it('dump', () => {
  console.log(getKoreanWordBank().map(({ word, emoji }) => `${word} ${emoji}`).join('\n'));
});
JS
npx vitest run zz-dump
rm src/data/zz-dump.test.js
```

출력된 목록을 한 줄씩 보고 규칙 ③·④에 어긋나는 항목을 고친 뒤 Step 5를 다시 돌린다. 고친 항목은 보고에 적는다. `git status`에 `zz-dump.test.js`가 남아 있지 않은지 확인한다.

- [ ] **Step 7: 커밋**

```bash
git add src/data/hangulMassWordBank.js src/data/elementaryPictureExtra.json src/data/hangulMassWordBank.test.js
git commit -m "fix(hangul): 단어장을 그림 1개=단어 1개로 정리하고 무작위 그림 제거

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 8: 보고** — 최종 단어 수, Step 5·6에서 결정표 밖으로 추가로 바꾼 항목 목록, 테스트 출력.

---

### Task 2: 오답 소리 후 고른 단어 읽기 함수 (Claude)

**Files:**
- Modify: `src/components/hangul/hangulWrongJingle.js` (파일 끝에 추가)
- Create: `src/components/hangul/hangulWrongJingle.test.js`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/components/hangul/hangulWrongJingle.test.js`:

```js
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
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run hangulWrongJingle`
Expected: FAIL — `playWrongJingleThenSay is not a function`

- [ ] **Step 3: 구현** — `src/components/hangul/hangulWrongJingle.js` 파일 끝에 추가:

```js
/** 징글("띵띵띵띠~")이 끝나는 시점 */
const SAY_AFTER_JINGLE_MS = 1100;

/**
 * 오답 징글을 울리고, 끝나면 "<word>! 아니에요~"를 읽어 준다.
 * @returns {() => void} 아직 읽기 전이면 읽기를 취소하는 함수
 */
export function playWrongJingleThenSay(word) {
  if (typeof window === 'undefined') return () => {};
  if (localStorage.getItem(LS_MUTED) === '1') return () => {};

  void playHangulWrongJingle();
  const timer = window.setTimeout(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(`${word}! 아니에요~`);
    utterance.lang = 'ko-KR';
    window.speechSynthesis.speak(utterance);
  }, SAY_AFTER_JINGLE_MS);

  return () => window.clearTimeout(timer);
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run hangulWrongJingle`
Expected: 4 passed

- [ ] **Step 5: 커밋**

```bash
git add src/components/hangul/hangulWrongJingle.js src/components/hangul/hangulWrongJingle.test.js
git commit -m "feat(hangul): 오답 징글 뒤 고른 단어를 읽는 playWrongJingleThenSay 추가

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: 1번 게임 — 사전 단어만 그림 표시 (Claude)

**Files:**
- Modify: `src/pages/game1/CombineSoundsGame.jsx:4-8`, `:47-53`, `:161-164`

이 게임은 컴포넌트 테스트 도구(jsdom/Testing Library)가 없어서 브라우저로 확인한다(Task 6).

- [ ] **Step 1: import에서 `getEmojiForWord` 제거** (이 변경으로 안 쓰게 됨)

```jsx
import {
  getWordEmojiDictionary,
  getKoreanWordBankSize,
} from '../../data/hangulMassWordBank.js';
```

- [ ] **Step 2: `getWordInfo` 교체**

```jsx
function getWordInfo(text) {
  if (!text) return null;
  // 미완성(자음/모음만 있거나 조합 실패로 자모가 섞인 경우)이면 이모지 없음 — 사전 조회보다 먼저 검사
  if (!isFullyComposedHangul(text)) return null;
  // 사전에 있는 단어일 때만 그림을 보여 준다(무작위 그림 없음)
  const emoji = WORD_DICTIONARY[text];
  return emoji ? { word: text, emoji } : null;
}
```

그리고 바로 위 주석 `// 검수된 단어→그림 맵 + 사전에 없는 조합만 해시 이모지(장식)`를 `// 검수된 단어→그림 맵 (사전에 있는 단어만 그림 표시)`로 바꾼다.

- [ ] **Step 3: 안내 문구 교체**

```jsx
      <p className={styles.bankHint}>
        연동 사전: 약 <strong>{WORD_BANK_SIZE.toLocaleString('ko-KR')}</strong>개 단어 (사전에 있는 단어를 만들면
        그림이 나와요)
      </p>
```

- [ ] **Step 4: lint 확인**

Run: `npx eslint src/pages/game1/CombineSoundsGame.jsx --ext jsx`
Expected: 0 errors, 경고는 기존의 `'React' is defined but never used` 1개만

- [ ] **Step 5: 커밋**

```bash
git add src/pages/game1/CombineSoundsGame.jsx
git commit -m "fix(hangul-game1): 사전에 없는 글자에는 무작위 그림을 보여 주지 않음

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: 3번 게임 — 오답 읽기 + 정답 후 잠금 (Claude)

**Files:**
- Modify: `src/pages/game3/PictureMatchGame.jsx` (전체 교체)

- [ ] **Step 1: 파일 전체를 아래로 교체**

바뀌는 점: `playWrongJingleThenSay` 사용, `locked` 상태로 정답 후 버튼 잠금, 화면을 나가면 타이머·읽기 정리. 나머지(문제 뽑기, 정답 TTS, 흔들림)는 그대로.

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { playWrongJingleThenSay } from '../../components/hangul/hangulWrongJingle.js';
import { getKoreanWordBank } from '../../data/hangulMassWordBank.js';
import styles from '../game1/Game.module.css'; // Reusing styles

const DICTIONARY = getKoreanWordBank();

// 배열을 무작위로 섞어주는 함수
const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

export default function PictureMatchGame() {
  const navigate = useNavigate();
  const [target, setTarget] = useState(null);
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState('그림에 맞는 단어를 찾아보세요!');
  const [isWrong, setIsWrong] = useState(false);
  // 정답 후 다음 문제가 나올 때까지 버튼 잠금 (연타로 두 번 넘어가는 것 방지)
  const [locked, setLocked] = useState(false);
  const cancelSayRef = useRef(() => {});
  const nextTimerRef = useRef(0);

  // 새로운 문제를 출제하는 함수
  const nextTurn = () => {
    const shuffled = shuffle(DICTIONARY);
    const answer = shuffled[0];
    const wrongs = shuffled.slice(1, 4); // 오답 보기 3개 추출 (총 4개 보기)
    
    setTarget(answer);
    setOptions(shuffle([answer, ...wrongs])); // 정답과 오답을 섞어서 배치
    setFeedback('그림에 맞는 단어를 찾아보세요!');
    setIsWrong(false);
    setLocked(false);
  };

  useEffect(() => {
    nextTurn();
    // 화면을 나가면 예약된 다음 문제와 오답 읽기를 정리
    return () => {
      cancelSayRef.current();
      window.clearTimeout(nextTimerRef.current);
    };
  }, []);

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

  const handleGuess = (word) => {
    if (!target || locked) return;
    // 앞에서 틀린 단어를 아직 읽기 전이면 취소 (목소리 겹침 방지)
    cancelSayRef.current();

    if (word === target.word) {
      setLocked(true);
      setFeedback('🎉 정답입니다! 참 잘했어요!');
      playTTS(`${word}! 딩동댕동!`, 1.5, 1.1); // 정답일 땐 높고 경쾌한 목소리
      nextTimerRef.current = window.setTimeout(nextTurn, 2000); // 2초 뒤 다음 문제로
    } else {
      setFeedback('🤔 앗! 다시 생각해보세요~');
      setIsWrong(true);
      cancelSayRef.current = playWrongJingleThenSay(word); // 오답 소리 뒤 고른 단어 읽기
      setTimeout(() => setIsWrong(false), 600); // 흔들림 애니메이션 해제
    }
  };

  if (!target) return null;

  return (
    <div className={styles.gameContainer}>
      <h2>3. 그림 카드 맞추기</h2>
      <p className={styles.feedbackText}>{feedback}</p>
      
      {/* 오답일 때 shake 클래스가 붙어 화면이 흔들립니다 */}
      <div className={`${styles.resultArea} ${isWrong ? styles.shake : ''}`}>
        <div className={styles.bigEmojiBox}>{target.emoji}</div>
      </div>

      <div className={styles.buttonGrid}>
        {options.map((opt, idx) => (
          <button 
            key={idx} 
            className={styles.wordOptionBtn}
            disabled={locked}
            onClick={() => handleGuess(opt.word)}
          >
            {opt.word}
          </button>
        ))}
      </div>

      <button className={styles.backBtn} onClick={() => navigate('/hangul-game')}>게임 목록으로</button>
    </div>
  );
}
```

- [ ] **Step 2: lint 확인**

Run: `npx eslint src/pages/game3/PictureMatchGame.jsx --ext jsx`
Expected: 0 errors, 경고는 기존 `'React' is defined but never used` 1개만

- [ ] **Step 3: 커밋**

```bash
git add src/pages/game3/PictureMatchGame.jsx
git commit -m "fix(hangul-game3): 틀린 단어 읽어 주기, 정답 후 연타 잠금

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: 6번 게임 — 틀린 보기 읽기 (Claude)

**Files:**
- Modify: `src/pages/game6/PoopDodgeGame.jsx:3`, `:94-100`(refs), `:122-139`(`triggerHit`), `:190-191`(`handleChoice` else)

- [ ] **Step 1: import 교체**

```jsx
import {
  playHangulWrongJingle,
  playWrongJingleThenSay,
} from '../../components/hangul/hangulWrongJingle.js';
```

- [ ] **Step 2: ref 추가** — `const levelRef = useRef(1);` 바로 아래에:

```jsx
  const cancelSayRef = useRef(() => {});
```

그리고 `levelRef.current = level;` 세 줄 묶음 바로 아래에 언마운트 정리를 추가:

```jsx
  // 화면을 나가면 아직 읽지 않은 오답 읽기를 취소
  useEffect(() => () => cancelSayRef.current(), []);
```

- [ ] **Step 3: `triggerHit`이 틀린 단어를 받게 변경** — 기존 `void playHangulWrongJingle();` 한 줄을 교체:

```jsx
  const triggerHit = useCallback((wrongWord) => {
    if (frozenRef.current || gameOverRef.current) return;
    frozenRef.current = true;
    setFrozen(true);
    setBearHit(true);
    setSplat(true);
    playSplatSound();
    if (wrongWord) {
      // 틀린 보기를 골랐을 때: 오답 소리 뒤 고른 단어 읽기
      cancelSayRef.current();
      cancelSayRef.current = playWrongJingleThenSay(wrongWord);
    } else {
      // 시간 초과: 고른 단어가 없으므로 오답 소리만
      void playHangulWrongJingle();
    }
    loseLifeAndMaybeEnd();
```

(그 아래 `setFeedback(...)`부터 `}, [beginRound, loseLifeAndMaybeEnd]);`까지는 그대로.)
`onTimeUpRef.current`의 `triggerHit();`는 인자 없이 그대로 둔다.

- [ ] **Step 4: `handleChoice`의 else 분기 교체**

```jsx
    } else {
      triggerHit(word);
    }
```

- [ ] **Step 5: lint 확인**

Run: `npx eslint src/pages/game6/PoopDodgeGame.jsx --ext jsx`
Expected: 0 errors, 경고는 기존 `'React' is defined but never used` 1개만

- [ ] **Step 6: 커밋**

```bash
git add src/pages/game6/PoopDodgeGame.jsx
git commit -m "fix(hangul-game6): 틀린 보기를 고르면 그 단어를 읽어 줌

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Codex 결과 검토 + 전체 검증 (Claude, Task 1~5 완료 후)

- [ ] **Step 1: Codex 변경 검토**

Run: `git show --stat <Task 1 커밋>` 후 `git show <Task 1 커밋> -- src/data/`
확인할 것:
- 결정표 A·B·C가 모두 반영됐는지
- 수정 파일이 `src/data/` 3개뿐인지
- 결정표 밖 추가 변경이 규칙 ①~④에 맞는지 (맞지 않으면 직접 고치고 별도 커밋)

- [ ] **Step 2: 전체 테스트**

Run: `npm test`
Expected: 3 files, 11 passed (기존 2 + 단어장 5 + 읽기 4)

- [ ] **Step 3: 고친 파일 lint**

Run:
```bash
npx eslint src/data src/components/hangul src/pages/game1 src/pages/game3 src/pages/game6 --ext js,jsx
```
Expected: 0 errors, 경고는 기준선과 같은 7개(`'React'` 5개, `Outlet` 1개, `HangulGameBgm` 1개).

- [ ] **Step 4: build (dist를 건드리지 않음)**

Run: `npx vite build --outDir /tmp/hangul-build-check --emptyOutDir`
Expected: `✓ built in ...`

- [ ] **Step 5: 브라우저 확인**

`npx vite` 실행 후 `http://localhost:5173/hangul-game` 에서:
1. 홈: 단어 개수가 480이 아닌 새 개수로 표시
2. 1번: ㄱ+ㅏ → "가" 그림 없음. ㄱㅗㅇㅑㅇㅇㅣ → "고양이" 🐱
3. 3번: 일부러 틀림 → 징글 후 "○○! 아니에요~". 연달아 두 개 틀림 → 마지막 단어만 읽음. 정답 후 2초 안에 보기 연타 → 버튼 비활성, 다음 문제 한 번만
4. 6번: 틀린 보기 → 징글 후 그 단어 읽음. 시간 초과 → 징글만
5. 3번·6번 문제 10개씩 넘기며 그림에 맞는 보기가 2개인 경우가 없는지 확인

- [ ] **Step 6: 브라우저 확인에서 문제가 나오면** superpowers:systematic-debugging으로 원인을 찾고, 고친 뒤 Step 2~5를 다시 한다.

---

### Task 7: 기록 (Claude)

**Files:**
- Modify: `qa.md` (끝에 추가), `task.md` (끝에 추가)

- [ ] **Step 1: `task.md` 끝에 추가** (실제 단어 수와 커밋 해시로 채움)

```markdown

## /nh:make 한글 게임 그림-단어 불일치 해결 (2026-09-24)
- Symptom:
  - 단어 480개가 그림 346개를 나눠 써서 212개 단어가 같은 그림을 공유 → 3·6번 퀴즈에서 맞아 보이는 보기가 2개 이상.
  - 1번에서 사전에 없는 글자에 무작위 그림 표시. 3·6번은 틀려도 고른 단어를 읽지 않음. 3번은 정답 후 연타 시 두 번 넘어감.
- Work:
  - 단어장을 그림 1개 = 단어 1개로 정리, `hashEmoji` 제거, 재발 방지 테스트 추가 (Codex 세션).
  - `playWrongJingleThenSay(word)` 추가, 3·6번 오답 시 고른 단어 읽기.
  - 1번은 사전 단어만 그림 표시, 3번 정답 후 버튼 잠금.
- Verification:
  - `npm test` (Node 20)
  - `npx eslint src/data src/components/hangul src/pages/game1 src/pages/game3 src/pages/game6 --ext js,jsx`
  - `npx vite build --outDir /tmp/hangul-build-check`
  - 브라우저 수동 확인 (1·3·6번)
```

- [ ] **Step 2: `qa.md` 끝에 추가**

```markdown

## 한글 게임 그림-단어 불일치 QA (2026-09-24)
- 기준: 3·4·5·6번 어떤 문제에서도 그림에 맞는 보기가 하나, 틀리면 고른 단어를 읽음, 1번에 틀린 그림 없음.
- 자동 테스트: `src/data/hangulMassWordBank.test.js`(그림 중복·단어 중복·길이·null 반환·게임4 첫 글자 8개), `src/components/hangul/hangulWrongJingle.test.js`(1.1초 뒤 읽기·취소·음소거·speechSynthesis 없음).
- 결과: <Task 6 결과 PASS/FAIL 기재>
- 남은 위험: 전체 `npm run lint`는 작업 전부터 실패(React 플러그인 미설정). 5번 화이트보드는 여전히 글씨를 인식하지 않음(범위 밖). 2번 게임 미구현(범위 밖).
```

- [ ] **Step 3: 커밋**

```bash
git add qa.md task.md
git commit -m "docs: 한글 게임 그림-단어 불일치 수정 기록

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```
