# NH Ninja QA Report (2026-04-24)

## 1) 범위
- 대상: `public/games/ninja/script.js`의 스테이지 전환 로직과 `public/games/ninja/tests/logic.test.js`의 회귀 검증
- 목적: Stage 1에서 Stage 2로 넘어가지 않는 이슈를 수정하고, 필수 재현 시나리오를 QA 결과에 명시

## 2) 이슈 분석
- 현상: 사용자 기준 QA 시나리오에서 Stage 1 진행 중 보스 전환 조건 체감이 불일치해, Stage 2 전환 실패로 인식되는 케이스 발생
- 원인: Stage 1 보스 호출 임계값이 `800~900` 랜덤(`Phaser.Math.Between(800, 900)`)으로 설정되어 있어, QA 기준인 `800점 이상`과 런타임 조건이 일치하지 않음
- 영향: `800점` 도달 시 즉시 보스가 호출되지 않으면 이후 흐름(보스 처치 -> `STAGE 1 CLEAR` -> Stage 2)이 재현 단계에서 끊긴 것으로 보일 수 있음

## 3) 수정 내용
- 파일: `public/games/ninja/script.js`
  - `bossTriggerScore`를 랜덤에서 고정값으로 변경
  - 변경 전: `this.score + Phaser.Math.Between(800, 900)`
  - 변경 후: `this.score + 800`
- 파일: `public/games/ninja/tests/logic.test.js`
  - QA 필수 흐름 회귀 테스트 `testStage1ToStage2QaFlow()` 추가
  - 검증 항목:
    - 캐릭터 선택 완료 상태
    - 청람 구슬 미획득 시 보스 미호출
    - 청람 구슬 획득 후 799점에서는 보스 미호출
    - 청람 구슬 획득 후 800점에서 보스 호출
    - 보스 처치 후 `STAGE 1 CLEAR` 문구 유지
    - 다음 스테이지가 2로 설정

## 4) 필수 재현 기준 검증 결과 (요구사항 반영)
- 시나리오: `스테이지 1 캐릭터 선택 -> 청람 구슬 확보 -> 800점 이상 도달 -> 보스 처치 -> STAGE 1 CLEAR -> Stage 2 전환`
- 결과: **PASS**
- 근거:
  - 런타임 임계값을 QA 기준과 동일한 `800점`으로 고정
  - 단위 로직 테스트에 동일 시나리오를 명시적으로 추가해 회귀 방지

## 5) 실행 검증 로그
- `node --check public/games/ninja/script.js`
- `node public/games/ninja/tests/logic.test.js`

## 6) 리스크 및 후속 권장
- 현재 수정은 Stage 1 보스 호출 임계값을 QA 기준에 맞추는 최소 변경이므로 기존 전환 체인(`goToNextStage`, `stageAdvanceTicket`, watchdog)은 유지됨
- 후속으로 E2E에서 실제 플레이 흐름(허브 -> 캐릭터 선택 -> Stage 2 진입) 자동화를 추가하면 UI/입력/씬 전환까지 포함한 안정성 검증이 강화됨
## 한글 게임 그림-단어 불일치 QA (2026-09-24)
- 기준: 3·4·5·6번 어떤 문제에서도 그림에 맞는 보기가 하나, 틀리면 고른 단어를 읽음, 1번에 틀린 그림 없음.
- 자동 테스트:
  - `src/data/hangulMassWordBank.test.js`: 그림 중복 0, 원본 단어 중복 0, 한글 1~8자·그림 있음, 없는 말은 null, 게임4 첫 글자 8개 이상, 포함 관계 단어 쌍 30개가 함께 있지 않음.
  - `src/components/hangul/hangulWrongJingle.test.js`: 1.1초 뒤 "<단어>! 아니에요~" 읽기(1099ms엔 안 읽음), 취소, 음소거, speechSynthesis 없음.
- 결과:
  - 자동 테스트·lint(고친 파일)·build: **PASS**
  - 브라우저 수동 확인(소리 포함): **사용자 확인 대기** — 자동화 Chrome이 로컬 개발 서버에 접속하지 못해 사람이 직접 확인하기로 함.
- 코드 리뷰(서브에이전트): 치명적 문제 없음. 지적된 남은 헷갈림 짝(비/구름, 곰/인형, 감자/감자튀김, 책/공책)과 ✨ 대체 그림은 782db6e에서 수정.
- 남은 위험:
  - 6번: 틀린 단어 읽기(1.1초 시작)가 다음 문제(2.2초 시작)에 약 0.4초 겹침. 읽는 도중 끊는 것보다 자연스러워 유지.
  - 화면을 나갈 때 이미 읽기 시작한 소리는 끝까지 재생됨(예약된 읽기만 취소).
  - 약한 헷갈림 짝(고래/돌고래, 선물/상자, 닭/치킨)은 유지.
  - 범위 밖: 전체 `npm run lint` 실패(React 플러그인 미설정), 5번 화이트보드 글씨 미인식, 2번 게임 미구현.
