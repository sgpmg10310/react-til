# 한글 게임 캐릭터 목소리 + 배경음 OFF 오답 무음 버그 설계

- 작성일: 2026-09-25
- 대상: `/hangul-game` 게임 1·3·4·5·6

## 1. 배경

- 사용자가 실제 인물(유튜버) 목소리를 원했으나, 무단 음성 복제는 퍼블리시티권·부정경쟁방지법 위험이 있고 음성 복제 서비스 약관도 금지한다. 사이트는 GitHub Pages로 공개 배포되므로 **특정 인물을 흉내 내지 않은 오리지널 캐릭터**("신나는 실험 유튜버형")로 한다.
- 버그: 배경음 버튼을 `🔇 배경음 OFF`로 두면 3·6번에서 틀려도 아무 소리가 나지 않는다(사용자 확인: OFF 상태, 정답 소리는 들림).
  - 원인: `HangulGameBgm.jsx`가 `localStorage['hangul-bgm-muted']='1'`을 저장하고, `hangulWrongJingle.js`의 `playHangulWrongJingle()`과 `playWrongJingleThenSay()`가 이 값이면 바로 반환한다. 정답 TTS는 이 값을 보지 않아 들린다.
  - 결정: **배경음 OFF는 음악만 끈다.** 오답 징글과 모든 목소리는 이 값과 무관하게 재생한다.

## 2. 범위

포함:
- 공용 목소리 모듈 `src/components/hangul/hangulVoice.js`
- 게임 1·3·4·5·6의 목소리를 이 모듈로 교체, 게임별로 복사된 `playTTS`/`playSound` 제거
- 오답 징글·오답 읽기의 음소거 검사 제거
- 5번 대사의 조사 오류("{단어} 네요!") 수정

제외:
- 6번 정답 대사 추가(다음 문제가 0.65초 뒤 시작해 소리가 겹침)
- 별도 "목소리 ON/OFF" 버튼
- 유료 TTS·녹음 파일

## 3. 설계

### 3.1 `hangulVoice.js`

목소리 두 종류:

| 종류 | pitch | rate | 용도 |
|---|---|---|---|
| `CHARACTER` | 1.4 | 1.15 | 감탄사·게임 대사 |
| `WORD` | 1.1 | 0.95 | 학습할 글자·단어 |

대사(조사를 붙이지 않고 단어 뒤를 느낌표로 끊는다):

```js
const CORRECT_LINES = [
  ['오오오!', '대성공~!'],
  ['대박!', '맞았다!'],
  ['예스!', '천재인데요?'],
];
const WRONG_LINES = [
  ['어라라?', '아니에요~ 다시 가보자고!'],
  ['어엇!', '아니에요~'],
  ['아쉽다!', '아니에요~'],
];
```

내보내는 함수:

| 함수 | 읽는 조각 |
|---|---|
| `sayWord(text)` | `[WORD text]` |
| `sayCorrect(word)` | `[CHARACTER 앞말] [WORD word!] [CHARACTER 뒷말]` |
| `sayWrong(word)` | `[CHARACTER 앞말] [WORD word!] [CHARACTER 뒷말]` |
| `sayLine(line, word?)` | `[CHARACTER line]` + (word가 있으면) `[WORD word!]` |

동작 규칙:
- 읽기 전에 `speechSynthesis.cancel()` 후 조각들을 순서대로 `speak()` (Web Speech가 큐에 넣고 차례로 읽음).
- 모든 조각은 `lang='ko-KR'`.
- 대사는 목록에서 무작위로 고르되 **직전에 고른 것과 같은 번호는 피한다** (정답·오답 목록 각각 따로 기억).
- 목소리 선택: `speechSynthesis.getVoices()` 중 `lang`이 `ko`로 시작하는 목소리. **컴퓨터에 설치된 목소리(`localService`)를 먼저**(리뷰 반영: 인터넷 목소리는 폐쇄망에서 조용히 실패), 그 안에서 이름에 `Google|Yuna|Neural|Natural`이 들어간 것을 우선, 설치된 목소리가 없으면 같은 규칙으로 전체에서, 그래도 없으면 첫 한국어 목소리, 한국어 목소리가 없으면 `voice`를 지정하지 않는다(브라우저 기본값). 목록이 비어 있으면(아직 로딩 전) 지정하지 않고, 다음 호출에서 다시 찾는다.
- `window` 또는 `window.speechSynthesis`가 없으면 아무것도 하지 않는다.
- `stopVoice()`: 읽는 중·대기 중인 목소리를 모두 멈춘다. 3·6번 화면을 나갈 때, 6번 새 문제 시작(`beginRound`) 때 부른다(리뷰 반영: 오답 대사가 다음 문제 위로 겹침).
- 배경음 음소거 값을 읽지 않는다.

### 3.2 `hangulWrongJingle.js`

- `playHangulWrongJingle()`: `localStorage` 음소거 검사 줄을 삭제. 파일 머리 주석의 "배경음과 동일하게 hangul-bgm-muted 시 무음" 문구를 "배경음 OFF와 무관하게 항상 재생"으로 바꾼다. 쓰이지 않게 되는 `LS_MUTED` 상수를 삭제.
- `playWrongJingleThenSay(word)`: 음소거 검사 삭제. 1100ms 뒤 `sayWrong(word)` 호출. 반환값(타이머 취소 함수)은 그대로.

### 3.3 게임별 교체

| 파일 | 지금 | 바뀐 뒤 |
|---|---|---|
| game1 `CombineSoundsGame.jsx` | `playSound(value)`, `playSound(fullText)` | `sayWord(value)`, `sayWord(fullText)`; `playSound` 삭제 |
| game3 `PictureMatchGame.jsx` | `playTTS(\`${word}! 딩동댕동!\`, 1.5, 1.1)` | `sayCorrect(word)`; `playTTS` 삭제 |
| game4 `LetterToImageGame.jsx` | `playTTS(item.char)` / `playTTS("얍!", 1.5, 1.5)` / `playTTS(\`${word}!\`, 1.2, 1.0)` | `sayWord(item.char)` / `sayLine('얍!')` / `sayLine('짜잔!', word)`; `playTTS` 삭제 |
| game5 `WhiteboardGame.jsx` | `'먼저 글자를 써 주세요!'` / `'수리수리 마수리... 얍!'` / `` `혹시 ${char} 글자를 쓰셨나요? ${word} 네요!` `` | `sayLine('먼저 글자를 써 주세요!')` / `sayLine('수리수리 마수리... 얍!')` / `sayLine(\`혹시 ${char} 글자를 쓰셨나요?\`, word)`; `playTTS` 삭제 |
| game6 `PoopDodgeGame.jsx` | 오답은 `playWrongJingleThenSay` | 변경 없음 (함수 내부가 `sayWrong`로 바뀜) |

## 4. 테스트

Vitest(`environment: 'node'`), 가짜 `window`/`speechSynthesis`/`SpeechSynthesisUtterance`:

`src/components/hangul/hangulVoice.test.js`
- `sayCorrect('호랑이')`: `cancel` 1회 후 조각 3개. 가운데 조각 text `'호랑이!'`, pitch 1.1, rate 0.95. 양옆은 pitch 1.4, rate 1.15. 앞·뒷말 쌍이 `CORRECT_LINES` 중 하나. 모든 조각 `lang='ko-KR'`.
- `sayWrong`: 같은 구조, `WRONG_LINES` 중 하나.
- 같은 대사 연속 금지: `Math.random`을 항상 0으로 고정해도 두 번째 호출은 첫 번째와 다른 대사.
- `sayWord('가')`: 조각 1개, WORD 목소리, 느낌표 없음.
- `sayLine('얍!')`: 조각 1개 CHARACTER. `sayLine('짜잔!', '곰')`: 조각 2개, 두 번째 `'곰!'` WORD.
- 목소리 선택: 목소리 목록 `[en-US, ko-KR 'Yuna', ko-KR 'Other']`에서 `Yuna` 선택. 한국어 없으면 `voice` 미지정.
- `speechSynthesis` 없음: 오류 없음.

`src/components/hangul/hangulWrongJingle.test.js` (수정)
- "음소거면 읽지 않는다" → **"배경음을 꺼도(hangul-bgm-muted=1) 읽는다"**.
- 1.1초 뒤 읽는 조각 중 가운데가 `'사자!'`, 앞말이 `WRONG_LINES` 앞말 중 하나.
- 취소·speechSynthesis 없음 테스트 유지.

## 5. 검증

1. `npm test` (Node 20) 통과
2. 고친 파일 lint 오류 0, 기존 경고 외 새 경고 없음
3. `npx vite build --outDir <임시폴더>` 성공
4. 배포 후 사람이 확인: 배경음 OFF 상태에서 3번·6번 오답 시 징글 + 캐릭터 오답 대사, 3번 정답 시 캐릭터 정답 대사, 1번 자모는 또박또박.

**성공 기준:** 배경음 OFF와 상관없이 틀리면 소리가 나고, 모든 한글 게임 목소리가 같은 캐릭터로 들리며, 단어는 또박또박 읽힌다.
