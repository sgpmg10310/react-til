# 🛠️ SKILL GUIDE — 볼링 조추첨 + 인형뽑기 프로젝트

이 문서는 프로젝트를 이해하고 기능을 추가/수정할 때 참고하는 기술 가이드입니다.

---

## 🏗️ 아키텍처 개요

```
순수 정적 웹앱 (Static HTML/CSS/JS)
├── index.html     — 메인 흐름 (슬라이드 0~12)
├── battle.html    — 배틀 미니게임 (독립 실행)
├── claw.html      — 인형뽑기 게임 (독립 실행)
├── css/           — 스타일시트
└── js/            — 앱 로직 및 이펙트
```

**데이터 전달:** 페이지 간 `localStorage` 키로 JSON 데이터 공유  
**렌더링:** Canvas 2D API + CSS 애니메이션  
**의존성:** Google Noto Sans KR 폰트만 (외부 CDN 최소화)

---

## 📐 claw.html — 3D 투영 시스템

### 좌표계
```
wx  : 0.0(좌) ~ 1.0(우)  — 가로 위치
wz  : 0.0(뒤) ~ 1.0(앞)  — 깊이(depth)
clawY : 0.0(레일) ~ 1.0(바닥) — 집게 수직 위치
```

### 투영 공식 `project(wx, wz) → {sx, sy, sc}`
```js
sy = vanishY*H + (floorY*H - vanishY*H) * wz       // 깊이에 따른 화면Y
halfW = lerp(halfW_far, halfW_near, wz)              // 원근에 따른 폭
sx = vanishX*W + (wx - 0.5) * halfW * 2             // 화면X
sc = lerp(farScale, nearScale, wz)                   // 스케일
```

### 집게 화면 좌표 `getClawScreenPos() → {sx, sy, sc}`
```js
groundSY = project(CL.wx, CL.wz).sy  // 현재 wx,wz의 바닥 Y
railSY   = vanishY * H               // 레일 고정 Y
sy = railSY + (groundSY - railSY) * CL.clawY  // 수직 보간
```

### P3D 파라미터 (조정 가능)
| 키 | 기본값 | 의미 |
|---|---|---|
| vanishX | 0.5 | 소실점 X (중앙) |
| vanishY | 0.22 | 레일 높이 |
| floorY | 0.86 | 바닥 위치 |
| leftX / rightX | 0.06 / 0.94 | 기계 좌우 경계 |
| farScale / nearScale | 0.45 / 1.1 | 원근 스케일 범위 |

---

## 🦾 집게 상태 머신 (CL.state)

```
idle
  │ grabPressed → CL.clawPower 랜덤 설정
  ▼
dropping          (CL.clawY 증가 0→1, openA 감소)
  │ clawY >= 1.0 → tryGrab() 호출
  ▼
gripping          (0.35초 대기 연출, heldDoll 좌표 집게와 동기화)
  │
  ├─ heldDoll 있음 → rising
  └─ heldDoll 없음 → rising_empty
       ▼                   ▼
    rising             rising_empty
  (CL.clawY 감소)     (빈 집게 상승)
       │                   │
       │ dropRoll < dropChance?
       ├─ 놓침 → done_fail (heldDoll → dolls로 복귀, falling=true)
       └─ 유지 → to_exit
                    │ 목표 (0.95, 0.85) 도달
                    ▼
              done_success (exitDolls 애니메이션)
```

---

## 🎯 잡기 판정 `tryGrab()`

```js
// 판정 반경: 3D 세계 좌표 기준 0.28
dist3d = sqrt((d.wx-CL.wx)² + (d.wz-CL.wz)²)
successRate = min(0.92, baseRate + distBonus)
  baseRate  = 0.30 + CL.clawPower * 0.45  // 0.30~0.75
  distBonus = (dist3d / 0.28) * 0.40      // 멀수록 +0~0.40
```

**디자인 의도:**  
- 가까운 인형: 집게가 미끄러지기 쉬움 (distBonus 낮음)  
- 먼 인형: 집게가 깊이 걸려 잘 잡힘 (distBonus 높음)  
- clawPower 강함(💪): baseRate 높아서 전반적 성공률 ↑  
- clawPower 약함(😰): 상승 중 dropChance = 1 - clawPower 확률로 놓침  

---

## 🎨 캐릭터 렌더 `drawBattleChar(sz, faceC, bodyC, legC, hairC)`

캔버스 중심점(0,0) 기준으로 그림. 실제 렌더 시 `ctx.translate(sx, sy)` 후 호출.

```
캐릭터 좌표 기준:
  머리꼭대기: y = -sz * (10/20) = -sz/2
  발바닥:     y = +sz * (24/20) = +sz*1.2
  총 높이:    sz * 1.7
```

**인형을 바닥(sy)에 세우려면:**  
```js
ctx.translate(sx, sy - sz*1.2);  // 발바닥이 sy에 오도록
drawBattleChar(sz, ...);
```

**집게 팔 끝(cy+armLen)에 매달리게 하려면:**  
```js
ctx.translate(cx, cy + armLen + sz*0.5);  // 머리꼭대기가 팔 끝에 걸리도록
drawBattleChar(sz, ...);
```

---

## 💡 heldDoll 분리 패턴 (버그 방지 핵심)

```js
// ❌ 잘못된 방법: CL.holdDoll = 인덱스
//    dolls[인덱스]가 다른 인형을 가리킬 수 있음

// ✅ 올바른 방법:
heldDoll = dolls.splice(best, 1)[0]; // dolls에서 완전 제거
heldDoll.wx = CL.wx;                  // 집게 위치로 즉시 스냅
heldDoll.wz = CL.wz;
CL.holdDoll = 1;                      // 존재 여부만 표시

// 렌더링에서:
if (heldDoll !== null) {
  drawBattleChar(...heldDoll...);      // dolls 배열 참조 안 함
}

// 실패 시 복귀:
dolls.push(heldDoll);  // falling=true로 다시 dolls에 추가
heldDoll = null;
```

---

## 🔄 턴 관리 패턴

```js
// 1. startNextPlayer() — 현재 턴 플레이어로 게임 시작
// 2. initGame()         — 캔버스, 인형, CL 상태 초기화 + 루프 시작
// 3. grabUsed = true    — 집기 버튼 비활성화 (1회 제한)
// 4. showEndMsg()       — endingState, endingTimer 설정
// 5. update()           — endingTimer 감소 → endTurn() 자동 호출
// 6. endTurn()          — endTurnLock으로 중복 방지, currentTurn++
// 7. → showSlide('slide-intro') or showResult()
```

---

## 🛡️ 안전 코딩 패턴

### endTurnLock — 중복 endTurn 방지
```js
let endTurnLock = false;
function endTurn() {
  if (endTurnLock) return;
  endTurnLock = true;
  // ...
}
// initGame()에서 endTurnLock = false 초기화
```

### grabUsed — 1회 집기 제한
```js
if (grabPressed && !grabUsed) {
  grabUsed = true;
  document.getElementById('btnGrab').disabled = true;
  CL.state = 'dropping';
}
```

### endingState — 결과 대기 상태
```js
function skipTurn() {
  if (!gameRunning) return;
  if (endingState !== null) return;  // 결과 표시 중이면 무시
  endTurn();
}
```

---

## 🎭 인형 falling 물리

잡다가 놓친 인형은 `clawY` 좌표로 수직 낙하 시뮬레이션:

```js
// heldDoll 복귀 시:
heldDoll.falling = true;
heldDoll.clawY = 0.0;  // 레일 높이에서 시작
heldDoll.vy = 0;

// updateDolls()에서:
if (d.falling) {
  d.vy += 6.0 * dt;
  d.clawY = min(1.0, d.clawY + d.vy * dt * 0.35);
}

// drawDolls3D()에서:
if (d.falling && d.clawY !== undefined) {
  finalSY = railSY + (groundSY - railSY) * d.clawY;
}
ctx.translate(sx, finalSY - sz*1.2);
```

---

## 🎨 색상 프리셋

```js
const FC = ['#F4C57E','#FBBF24','#FDE68A','#F8D5A3','#E8B88A']; // 얼굴
const BC = ['#3B82F6','#EF4444','#10B981','#8B5CF6',...];         // 몸통
const LC = ['#1e3a5f','#1a1a1a','#374151','#1e1b4b','#422006'];   // 다리
const HC = ['#1a1a1a','#8B4513','#FFD700','#ff69b4',...];         // 머리카락
```
