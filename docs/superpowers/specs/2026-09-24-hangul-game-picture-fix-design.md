# 한글 게임: 그림-단어 불일치 해결 + 오답 읽어주기 설계

- 작성일: 2026-09-24
- 대상: `/hangul-game` 하위 게임 1~6

## 1. 문제

점검 결과(2026-09-24 기준):

- 공용 단어장(`src/data/hangulMassWordBank.js` + `elementaryPictureExtra.json`)에 단어 480개, 서로 다른 그림 346개. **212개 단어가 다른 단어와 같은 그림**을 쓴다.
  - 예: 🐕 = 허스키·진돗개·비글·치와와 등 17개, 🐦 = 새·참새·까치 등 9개, 🥕 = 무·당근
  - 그래서 3번·6번 퀴즈에서 보기 두 개가 모두 그림에 맞아 보이는데 하나만 정답이 된다.
- `HAND_PAIRS_STRING`에 같은 단어가 두 번 나와 뒤 값이 앞을 덮어쓴다: 13건 (`배🍐→🚢`, `밤🌰→🌃`, `모자`, `신발`, `우산` 등).
- 뜻과 다른 그림: `무🥕`, `비☔`, `전🥟`, `분필✏️`, `칠판⬛`, `등대🗼`, `자두🟣`, `잡채🥗`, `귀걸이💎` 등.
- 1번 게임: 사전에 없는 글자(예: "가")를 만들면 `hashEmoji`가 무작위 장식 그림을 보여 준다. 아이에게는 틀린 그림으로 보인다.
- 3번·6번: 틀리면 오답 소리만 나고 고른 단어를 읽어 주지 않는다.
- 3번: 정답 후 다음 문제까지 2초 동안 버튼이 잠기지 않아, 다시 누르면 정답 처리와 다음 문제 넘김이 두 번 일어난다.

## 2. 범위

포함:
- 단어장 정리 (그림 1개 = 단어 1개)
- 1번: 사전에 없는 글자는 그림 없이 글자만
- 3번·6번: 틀리면 고른 단어를 읽어 줌 (정답은 말하지 않음)
- 3번: 정답 후 버튼 잠금

제외 (별도 작업):
- 2번 게임 구현 (현재 "구현 예정" 화면)
- 5번 게임의 실제 글씨 인식 (현재 무작위 단어)
- 프로젝트 전반 정리 (Node 14 기본값, `react-query` v3/v5 중복, 루트 `KartRiderGameView.jsx`, 커밋된 `dist/`)

## 3. 설계

### 3.1 단어장 (담당: Codex 세션)

바꿀 파일: `src/data/hangulMassWordBank.js`, `src/data/elementaryPictureExtra.json`

규칙:
1. **그림 하나에는 단어 하나.** 같은 그림 묶음에서 아이가 그림만 보고 떠올릴 대표 단어만 남긴다.
   예: 🐕 강아지, 🐦 새, 🐟 물고기, 🍲 찌개, 🍗 치킨, 🧊 얼음, 🥕 당근, 🌙 달.
2. **단어 하나는 한 번만.** 뜻이 여러 개인 단어는 한 뜻만 둔다: `배=🍐`, `밤=🌰`, `모자=🧢`, `신발=👟`, `우산=☂️`.
3. **그림이 뜻과 맞아야 한다.** 더 맞는 그림이 있으면 바꾸고(`비→🌧️`), 없으면 뺀다(`무`, `자두`, `전`, `분필`, `칠판`, `등대` 등).
4. **초등 저학년이 아는 단어만.** 품종명(도베르만, 사모예드), 어려운 말(훠궈, 리조또)은 뺀다.

코드 변경:
- `FALLBACK_EMOJIS`, `hashEmoji`를 삭제한다.
- `getEmojiForWord(word)`는 사전에 없으면 `null`을 반환한다.
- 단어 길이 검사(`elementaryExtra` 필터)는 한글 1~8자를 허용한다.

재발 방지 테스트 `src/data/hangulMassWordBank.test.js` (Vitest):
- `getKoreanWordBank()` 결과에서 두 단어가 같은 그림을 쓰면 실패
- `HAND_PAIRS_STRING`과 JSON을 합친 원본에 같은 단어가 두 번 나오면 실패 (테스트를 위해 원본 목록을 내보내는 함수가 필요하면 `getRawWordPairsForTest()`를 export)
- 모든 단어가 한글 1~8자
- `getEmojiForWord('없는말')`이 `null`

예상 결과: 단어 약 300개. 홈 화면의 단어 개수 표시는 `getKoreanWordBankSize()`로 자동 반영된다.

### 3.2 공통 오답 읽기 함수 (담당: Claude)

위치: `src/components/hangul/hangulWrongJingle.js`에 추가

```js
/** 오답 징글 후 약 1.1초 뒤 "<word>! 아니에요~"를 읽는다. 반환값: 취소 함수 */
export function playWrongJingleThenSay(word)
```

- 기존 `playHangulWrongJingle()`을 호출한 뒤, 징글이 끝나는 1100ms 뒤 `speechSynthesis`로 `${word}! 아니에요~`를 읽는다 (`lang='ko-KR'`).
- 음소거(`localStorage['hangul-bgm-muted']==='1'`)면 징글과 같이 읽기도 하지 않는다.
- `speechSynthesis`가 없으면 읽기만 건너뛴다.
- 반환하는 취소 함수는 예약된 타이머를 지운다. 게임은 새 보기를 누를 때와 화면을 나갈 때 이전 취소 함수를 부른다.

### 3.3 게임별 변경 (담당: Claude)

**1번 `src/pages/game1/CombineSoundsGame.jsx`**
- `getWordInfo`: 사전에 있는 단어일 때만 `{ word, emoji }`, 아니면 `null` → 그림 없이 글자만.
- 기존의 "완성된 글자 읽기"는 그대로 둔다.
- 안내 문구를 "사전에 있는 단어를 만들면 그림이 나와요"로 바꾼다.

**3번 `src/pages/game3/PictureMatchGame.jsx`**
- 오답: `playWrongJingleThenSay(고른 단어)`. 정답은 말하지 않는다.
- 정답 후 다음 문제까지 버튼 잠금 (`locked` 상태, 잠금 중 클릭 무시).
- 언마운트 시 다음 문제 타이머와 읽기 취소.

**6번 `src/pages/game6/PoopDodgeGame.jsx`**
- 틀린 보기 클릭: `playWrongJingleThenSay(고른 단어)`.
- 시간 초과: 고른 단어가 없으므로 지금처럼 오답 징글만.
- 언마운트 시 읽기 취소.

**4번·5번**: 코드 변경 없음. 단어장 수정으로 자동 개선.

## 4. 진행 방법

- Codex 세션(`/orchestration`)은 `src/data/*`만, Claude 세션은 `src/components/hangul/*`, `src/pages/game1|3|6/*`만 수정해 파일 충돌을 막는다.
- 두 작업은 동시에 진행한다. Codex가 끝나면 Claude가 데이터 변경을 규칙 4가지 기준으로 검토한다.
- 변경 후 `qa.md`, `task.md`에 기록한다 (AGENTS.md 규칙).

## 5. 검증

모두 Node 20(`.nvmrc`)으로 실행:
1. `npm test` — 단어장 테스트 + 오답 읽기 함수 테스트(가짜 타이머, 가짜 `speechSynthesis`: 1.1초 뒤 읽기, 취소 시 읽지 않음, 음소거 시 읽지 않음)
2. `npm run lint`, `npm run build` 통과
3. 브라우저 수동 확인
   - 3번: 틀리면 징글 후 고른 단어를 읽음, 정답 후 연타해도 한 번만 넘어감
   - 6번: 틀린 보기를 누르면 고른 단어를 읽음
   - 1번: "가"는 그림 없음, "고양이"는 🐱

**성공 기준:** 3·4·5·6번 어떤 문제가 나와도 그림을 보면 답이 하나이고, 틀리면 고른 단어를 읽어 주며, 1번에는 틀린 그림이 나오지 않는다.
