# 🔗 HOOKS — 함수 연동 포인트 가이드

이 문서는 index.html ↔ claw.html ↔ battle.html 간의 데이터 흐름과 주요 함수 훅을 설명합니다.

---

## 🔄 페이지 간 데이터 흐름

```
index.html
  │
  ├─ [슬라이드 9] launchClawGame()
  │       └──▶ localStorage.setItem('clawGameData', JSON)
  │                   ↓
  │              window.location = 'claw.html'
  │
  └─ [슬라이드 10] buildScoreTables()
           └─ autoFillClawResult()
                   └──▶ localStorage.getItem('clawResult')
                               ↓
                         인형뽑기 입력란 자동 채움

claw.html
  ├─ init()
  │   └─ loadGameData() → localStorage.getItem('clawGameData')
  │
  └─ showResult()
       └──▶ localStorage.setItem('clawResult', JSON)
```

---

## 📌 index.html 주요 훅 (js/app.js)

### `launchClawGame()` — 인형뽑기 게임 진입
```js
// 호출 위치: 슬라이드9 버튼, 슬라이드10 인형뽑기 패널 버튼
// 역할: 현재 팀 데이터를 localStorage에 저장하고 claw.html로 이동
function launchClawGame() {
  const data = { teams: teams.map(t => ({
    name: t.name, color: t.color, emoji: t.emoji, members: t.members
  })) };
  localStorage.setItem('clawGameData', JSON.stringify(data));
  window.location.href = 'claw.html';
}
```

### `autoFillClawResult()` — 인형뽑기 결과 자동 입력
```js
// 호출 위치: buildScoreTables() 내부 (슬라이드10 진입 시)
// 역할: localStorage.clawResult 읽어 인형뽑기 입력란 자동 채움
function autoFillClawResult() {
  const raw = localStorage.getItem('clawResult');
  if (!raw) return;
  const result = JSON.parse(raw);
  result.forEach(r => {
    const input = document.querySelector(`#dollInput_${r.teamIdx}`);
    if (input) { input.value = r.caught; input.style.color = '#a78bfa'; }
  });
}
```

### `buildScoreTables()` — 점수 입력 UI 생성
```js
// 호출 위치: showSlide('slide-scores') 시
// 역할: 팀별 점수 입력 카드 생성, autoFillClawResult() 호출
```

### `toggleBonusGame(type)` — 보너스 게임 토글
```js
// 호출 위치: 인형뽑기/10초 체크박스 change 이벤트
// 역할: 최소 1개 선택 강제, 패널 표시/숨김 토글
// type: 'doll' | 'timer'
```

### `calculateAndShowResult()` — 최종 순위 계산
```js
// 호출 위치: 슬라이드10 "최종 순위 계산" 버튼
// 역할: 볼링 + 보너스 점수 합산 → 슬라이드12로 이동
```

---

## 📌 claw.html 주요 훅

### `init()` — 게임 초기화 진입점
```js
// 호출: DOMContentLoaded
// 역할: loadGameData() → buildIntroUI() → initStars()
```

### `loadGameData()` — 팀 데이터 로드
```js
// localStorage.clawGameData 파싱
// 없으면 기본 데모 데이터(A/B/C조) 사용
```

### `startNextPlayer()` — 다음 플레이어 게임 시작
```js
// 호출: "게임 시작" 버튼 or 자동 전환
// 역할: HUD 업데이트, initGame() 호출, slide-game으로 전환
```

### `initGame()` — 게임 상태 초기화
```js
// 역할:
//   - canvas 리사이즈
//   - generateDolls() 호출
//   - heldDoll = null, exitDolls = []
//   - grabUsed = false, endTurnLock = false
//   - CL 초기화 (idle 상태)
//   - 애니메이션 루프 시작
```

### `tryGrab()` — 집기 판정 (gripping 상태에서 호출)
```js
// 입력: CL.wx, CL.wz (집게 바닥 위치)
// 처리: 가장 가까운 인형 찾기 (반경 0.28)
// 성공: dolls.splice() → heldDoll, CL.holdDoll = 1
// 실패: dolls[best].wobble += π*0.6
```

### `endTurn()` — 턴 종료
```js
// 역할:
//   - endTurnLock 체크 (중복 방지)
//   - gameRunning = false, animFrame 취소
//   - currentTurn++
//   - 마지막 턴이면 showResult(), 아니면 slide-intro로
```

### `showResult()` — 결과 화면 표시
```js
// 역할:
//   - 팀별 scores 집계 → 순위 계산
//   - BONUS_PTS = [40,26,16,10,5] 적용
//   - localStorage.clawResult 저장
//   - 불꽃 애니메이션 시작
```

### `triggerGrab()` — 집기 트리거
```js
// 호출: 버튼 클릭, SPACE 키
// 조건: CL.state === 'idle' && !grabUsed
// 동작: grabPressed = true
```

### `skipTurn()` — 턴 건너뛰기
```js
// 호출: "건너뛰기" 버튼
// 조건: gameRunning && endingState === null
// 동작: endTurn() 직접 호출
```

---

## 🔑 localStorage 키 목록

| 키 | 방향 | 형식 | 설명 |
|---|---|---|---|
| `clawGameData` | index→claw | `{teams:[...]}` | 팀 이름/색상/이모지/멤버 |
| `clawResult` | claw→index | `[{teamIdx,teamName,caught,bonus}]` | 인형뽑기 결과 |
| `battleData` | index→battle | (별도 형식) | 배틀게임 데이터 |

---

## 🧩 확장 포인트

### 새 보너스 게임 추가 방법
1. `index.html` 슬라이드10에 체크박스 추가
2. `js/app.js` `toggleBonusGame()` 에 케이스 추가
3. `calculateAndShowResult()` 에서 점수 합산 로직 추가
4. 필요시 별도 HTML 파일 + localStorage 키로 결과 전달

### claw.html 인형 개수/위치 조정
```js
// generateDolls() 내부:
const count = 9 + Math.floor(Math.random()*3); // 9~11개
wx = 0.12 + Math.random()*0.76;  // 좌우 범위
wz = 0.10 + Math.random()*0.80;  // 깊이 범위
```

### 집게 난이도 조정
```js
// tryGrab() 내부:
const hitThreshold = 0.28;              // 판정 반경 (크게 = 쉬움)
const baseRate  = 0.30 + CL.clawPower * 0.45; // 기본 성공률 범위
const distBonus = distRatio * 0.40;    // 거리 보너스 (크게 = 멀리서도 잘 잡힘)

// updateClaw() > rising 상태:
const dropChance = 1.0 - CL.clawPower; // 놓침 확률 (낮게 = 덜 놓침)
```
