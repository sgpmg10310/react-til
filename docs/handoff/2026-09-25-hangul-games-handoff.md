# 인수인계: 한글 게임 개선 (2026-09-24 ~ 09-25)

다음 작업자(사람 또는 에이전트)가 이 문서만 읽고 이어서 일할 수 있도록 정리했다.

## 1. 한 줄 요약

`/hangul-game`의 게임 6종에서 **그림-단어 불일치**, **틀린 단어 읽어 주기**, **배경음 OFF 시 오답 무음 버그**를 고치고, 목소리를 **오리지널 캐릭터("신나는 실험 유튜버형")**로 통일했다. 모두 `main`에 들어가 GitHub Pages에 배포됨.

- 사이트: https://sgpmg10310.github.io/react-til/#/hangul-game
  - **주의:** 앱이 `HashRouter`라서 주소에 `#/`가 꼭 있어야 한다. `…/react-til/hangul-game`(# 없음)은 GitHub Pages 404가 뜬다. 버그가 아니다.

## 2. 한 일

### 2.1 그림-단어 불일치 (설계 `docs/superpowers/specs/2026-09-24-hangul-game-picture-fix-design.md`)

| 문제 | 조치 |
|---|---|
| 단어 480개가 그림 346개를 공유 (🐕 하나에 17개 단어 등) | **그림 1개 = 단어 1개**로 정리, 최종 **265개** |
| 같은 단어 중복으로 덮어씀 (`배🍐→🚢`, `밤🌰→🌃` 등 13건) | 한 뜻만 남김 (`배=🍐`, `밤=🌰`) |
| 포함 관계 단어가 같이 보기로 나옴 (새/비둘기, 공/농구, 곰/판다…) | 둘 중 하나만 (새·꽃·자동차 등 삭제, 공→축구) |
| 1번: 사전에 없는 글자에 무작위 그림 | 사전 단어만 그림 표시, `hashEmoji`·✨ 대체 제거 |
| 3·6번: 틀려도 고른 단어를 안 읽음 | 오답 징글 1.1초 뒤 고른 단어 읽기 (`playWrongJingleThenSay`) |
| 3번: 정답 후 연타 시 두 번 넘어감 | 정답 후 버튼 잠금 |

단어장 정리의 첫 단계는 Orca orchestration으로 **Codex 세션**에 맡겼고(결정표 방식), 나머지는 Claude 서브에이전트가 구현했다.

### 2.2 캐릭터 목소리 + 배경음 OFF 버그 (설계 `docs/superpowers/specs/2026-09-25-hangul-character-voice-design.md`)

| 문제/요청 | 조치 |
|---|---|
| 배경음 `🔇 OFF`면 3·6번 오답 시 아무 소리 없음 | 원인: 오답 징글·읽기가 `localStorage['hangul-bgm-muted']`를 같이 봄. **배경음 OFF는 음악만** 끄도록 음소거 검사 제거 |
| "허팝 목소리로" 요청 | **하지 않음** (아래 4장). 누구도 흉내 내지 않은 오리지널 캐릭터로 대체 |
| 게임마다 `playTTS` 복사본 4개 | 공용 모듈 `hangulVoice.js` 하나로 통합 |
| 5번 "`{단어} 네요!`" 조사 오류 | 조사 없이 `sayLine('혹시 ㄱ 글자를 쓰셨나요?', 단어)` |
| 리뷰: 인터넷 목소리(Google)는 폐쇄망에서 조용히 실패 | **설치된 목소리(`localService`) 우선** |
| 리뷰: 6번 오답 대사가 다음 문제 위로 겹침 | 새 문제 시작 시 `stopVoice()` |

## 3. 코드 지도

| 파일 | 역할 |
|---|---|
| `src/data/hangulMassWordBank.js` | 단어→그림 원본(`HAND_PAIRS_STRING`)과 조회 함수. `getEmojiForWord`는 없으면 `null` |
| `src/data/elementaryPictureExtra.json` | 초등 생활 단어 추가분 |
| `src/data/hangulMassWordBank.test.js` | 그림 중복 0, 단어 중복 0, 포함 관계 쌍(`CONFUSABLE_PAIRS` 30개) 없음 등 6개 |
| `src/components/hangul/hangulVoice.js` | 캐릭터 목소리. `sayWord`/`sayLine`/`sayCorrect`/`sayWrong`/`stopVoice`. CHARACTER 1.4/1.15, WORD 1.1/0.95 |
| `src/components/hangul/hangulWrongJingle.js` | 오답 징글(합성음) + `playWrongJingleThenSay(word)` (1.1초 뒤 `sayWrong`, 취소 함수 반환) |
| `src/components/hangul/HangulGameBgm.jsx` | 배경음 버튼. `hangul-bgm-muted`는 **이 파일만** 쓴다 |
| `src/pages/game1~6/*` | 게임. 목소리는 모두 `hangulVoice.js`를 통해서만 낸다 |

**새 단어를 넣을 때:** `HAND_PAIRS_STRING`에 `단어이모지`를 추가하고 `npm test`. 같은 그림·같은 단어가 있으면 테스트가 실패한다. 포함 관계(예: "동물"과 "사자")는 테스트가 못 잡으니 사람이 판단하고, 필요하면 `CONFUSABLE_PAIRS`에 추가한다.

**목소리를 바꿀 때:** `hangulVoice.js`의 `CHARACTER`, `WORD`, `CORRECT_LINES`, `WRONG_LINES`만 고친다. 대사에 조사(은/는)를 붙이지 말 것(받침마다 달라짐).

## 4. 결정 기록

- **실존 인물 목소리 복제는 하지 않는다.** 2022년 개정 부정경쟁방지법이 이름·얼굴·목소리의 무단 이용을 부정경쟁행위로 규정하고(퍼블리시티권), 음성 복제 서비스(예: ElevenLabs) 약관도 동의 없는 타인 복제를 금지한다. 사이트는 공개 배포라 "배포"에 해당한다. 허팝 공식 TTS는 조사 시점에 찾지 못했다. 쓰려면 본인·소속사의 서면 허락이 먼저다.
- **단어 수보다 "그림을 보면 답이 하나"를 우선**했다 (480 → 265).
- **배경음 버튼은 음악만** 끈다 (사용자 확인).
- 3번은 틀려도 **정답을 말하지 않는다** (재도전 게임).

## 5. 커밋

전체: `git log --oneline 1e0c3ad..868c575`

| 범위 | 커밋 |
|---|---|
| 그림-단어 (09-24) | `c2e7512` 설계, `cf08bf5` 계획, `1d0d4be` 오답 읽기, `47523d3` 단어장(Codex), `89e5875` 1번, `8e831c6`·`d8953cb`·`782db6e` 포함 관계 정리, `bb5f3a6` 3번, `c7eefc3` 6번, `184de94` 기록 |
| 캐릭터 목소리 (09-25) | `aaddbe1` 설계, `ece6e5c` 계획, `67873e9` 모듈, `628c069` 배경음 버그, `f4f206e` 1·3번, `f1cac10` 4·5번, `e46ad42` 리뷰 반영, `868c575` 기록 |

배포: GitHub Actions `Deploy to GitHub Pages` run `35988568177`(09-24), `36105660260`(09-25) 모두 성공.

## 6. 검증 방법

```bash
export PATH=$HOME/.nvm/versions/node/v20.20.2/bin:$PATH   # 기본 Node v14는 Vitest를 건너뜀 (.nvmrc = 20)
npm test                                                  # 4 files, 22 passed
npx eslint src/components/hangul src/data src/pages/game1 src/pages/game3 src/pages/game4 src/pages/game5 src/pages/game6 --ext js,jsx
npx vite build --outDir /tmp/<임시폴더> --emptyOutDir      # npm run build는 커밋된 dist/를 바꾸므로 확인용으론 쓰지 않음
```

- 자동 검증(09-25): 테스트 22개 통과, 고친 파일 lint 오류 0, build 성공.
- 공개 사이트 확인(09-25, 스크립트로 `speechSynthesis.speak` 가로채기, 배경음 OFF 상태):
  - 3번 오답 → "아쉽다!" / "엘리베이터!" / "아니에요~" (세 조각 모두 `Microsoft Heami`, 설치된 목소리)
  - 3번 정답 → "예스!" / "꿀!" / "천재인데요?", 연타해도 한 번만 넘어감

## 7. 남은 일 · 알려진 문제

**사람 확인 필요**
- 실제 스피커로 목소리를 들어 보기(높이·속도가 적당한지). 위 확인은 스크립트 클릭이라, 사람이 누를 때도 소리가 나는지는 아직 확인하지 않았다.

**알려진 한계 (의도적으로 둠)**
- 6번: 오답 대사는 새 문제가 시작되면(2.2초) 끊긴다. "어라라? 사자!"까지는 들린다.
- Chrome은 첫 호출 때 목소리 목록이 비어 있어 첫 대사만 기본 목소리일 수 있다.
- 약한 헷갈림 짝은 남김: 고래/돌고래, 선물/상자, 닭/치킨.

**범위 밖 (손대지 않음)**
- `npm run lint`는 작업 전부터 실패한다(ESLint에 React 플러그인이 없어 JSX 변수를 미사용으로 잡음, 오류 61·경고 141).
- 2번 "글자로 단어 만들기"는 미구현(준비 중 화면).
- 5번 화이트보드는 글씨를 인식하지 않고 무작위 단어를 보여 준다.
- `package.json`에 `react-query`(v3)와 `@tanstack/react-query`(v5)가 함께 있다. 루트에 떠도는 `KartRiderGameView.jsx`, 커밋된 `dist/`.
- GitHub Actions 경고: `actions/*@v4`가 Node 20 대상(강제로 Node 24 실행), `ubuntu-latest`가 2026-10-19부터 Ubuntu 26, `git failed with exit code 128`(모든 단계 ✓, 배포 영향 없음).

## 8. 작업 환경 주의

- 작업 폴더는 Orca 워크트리 `/Users/myungkeunpark/orca/workspaces/react-til/http-github.com-sgpmg10310-react-til` (브랜치 `sgpmg10310/http-github.com-sgpmg10310-react-til`). 메인 체크아웃은 `/Users/myungkeunpark/orca/react-til`.
- 원격 `main`의 `cc6e7ad`가 `.codex/`를 추적에서 뺐다. **받아 올 때 Git이 로컬 `.codex/` 파일(Codex 설정 포함)을 지우므로**, 먼저 복사해 두고 받은 뒤 되돌린다. 워크트리는 09-25에 이렇게 처리함. 메인 체크아웃은 아직 이 커밋을 받지 않았다.
- 같은 워크트리에서 여러 에이전트가 동시에 일할 때는 자기 파일만 경로 지정 커밋(`git commit -m … -- <files>`)을 쓴다. `git add -A`/`git stash` 금지.
- 로컬 개발 서버: `npx vite --host 127.0.0.1 --port 5173` (자동화 Chrome은 이 Mac의 로컬 서버에 접속하지 못했다. 공개 사이트로 확인할 것).
