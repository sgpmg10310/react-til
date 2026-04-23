# 상세 구현 설계 (add.md): NH Ninja V10.0

## 1. 시스템 구조
- 핵심 런타임은 `public/games/ninja/script.js`의 Phaser Scene 기반 단일 진입 구조를 사용한다.
- 씬 구성:
  - `TitleScene`: 시작 화면
  - `CharacterScene`: 캐릭터 선택
  - `StoryScene`: 브리핑
  - `GameScene`: 실제 플레이, 보스전, 스테이지 전환 담당
- `GameScene`는 스테이지 상태, HUD, 적 스폰, 유물, 보스, 전환 워치독까지 모두 소유한다.

## 2. 스테이지 모델
| Stage | 테마 | 주요 오브젝트 | 보스 | 보상 |
| --- | --- | --- | --- | --- |
| 1 | 제단/사당 | `stage1ShrineDoor`, `relic_spiral` | `boss` | stage1 relic skill |
| 2 | 성채/용의 방 | `castleDoor`, `relic_thunder` | `dragonBoss` | stage2 relic skill |
| 3 | 포털/악몽의 방 | `stage3Portals`, `relic_crimson` | `nightmareBoss` | final unlock loop |

## 3. 상태 모델
- 주요 상태 필드:
  - `stage`: 현재 스테이지 번호
  - `isBossActive`: 현재 보스전 진행 여부
  - `isStageClear`: 스테이지 클리어 연출 여부
  - `isPausedForStory`: 연출/전환 중 입력 정지 여부
  - `roomTransitionLocked`: 룸 이동/피격 차단 여부
  - `protectedUntil`: 보호 시간 만료 시각
  - `stageAdvanceTicket`: 워치독 강제 전환 티켓
  - `stageAdvanceStarted`: 중복 `scene.start()` 방지 플래그
  - `stageAdvancePending`: 보스 처치 직후부터 다음 씬 시작 전까지의 레이스 차단 플래그

## 4. 보스 처치 전환 계약
- 전환 표준 경로:
  - `damageEnemy()`
  - `handleEnemyDefeat()`
  - `startStage2AfterStage1Boss()` 또는 `goToNextStage()`
  - `stageAdvanceTicket`
  - `startNextStageScene()`
- 설계 원칙:
  - 전환 시작점은 보스 타입별 분기 후 반드시 `goToNextStage()`로 수렴한다.
  - 실제 씬 변경은 `startNextStageScene(nextStage)` 단일 진입점만 사용한다.
  - 지연 콜백 실패 시 `stageAdvanceTicket.forceAt`이 워치독으로 동일 진입점을 다시 호출한다.
  - 보스 처치 직후에는 `stageAdvancePending = true`를 먼저 세팅해 피격/게임오버 레이스를 차단한다.

## 5. 전환 시퀀스
1. 보스 HP가 0 이하가 되면 `handleEnemyDefeat()`가 호출된다.
2. 보스 타입이 `boss`, `dragonBoss`, `nightmareBoss`인 경우 즉시:
   - `stageAdvancePending = true`
   - `roomTransitionLocked = true`
   - `protectedUntil >= now + 2600`
3. 이후 `goToNextStage()`가 공통 연출 상태를 세팅한다.
4. `delayMs` 후 정상 콜백이 `startNextStageScene()`를 호출한다.
5. 콜백이 누락되면 `update()` 최상단의 `tryForceStageAdvanceFromTicket()`가 강제 진입한다.
6. `startNextStageScene()`는 `stageAdvanceStarted` 가드로 중복 시작을 차단하고 `stageAdvancePending = false`로 정리한다.

## 6. 데미지 처리 인터페이스
- `handleDamage(player, source)`는 아래 조건이면 즉시 반환해야 한다.
  - `isGameOver`
  - `isStageClear`
  - `isPausedForStory`
  - `stageAdvancePending`
  - `roomTransitionLocked`
  - `time.now < protectedUntil`
  - `isBossActive && boss && boss.hp <= 0`
- 의도:
  - 보스 사망 직후 스프라이트 비활성화 여부와 무관하게 후속 피격이 전환을 깨지 못하게 한다.

## 7. 입력 및 UX 인터페이스
- 키보드:
  - 이동, 점프, 공격, 스킬, 유물, 메뉴 입력 지원
- 터치 UI:
  - 좌측: 이동/점프
  - 우측: `KUNAI`, `ITEM`, `ULT`, `TECH`
- 연출 중 정책:
  - `isPausedForStory` 또는 전환 잠금 시 실질 입력 효과를 중단한다.

## 8. 테스트 계약
- 로직 테스트는 최소 아래를 보장해야 한다.
  - stage 1 boss kill -> nextStage 2
  - `STAGE 1 CLEAR` 문구 유지
  - `delayMs`와 `forceDelayMs` 이중 안전장치 유지
  - `stageAdvanceStarted` 중복 시작 방지
  - `stageAdvancePending` 동안 데미지 차단
- 검증 명령:
  - `node --check public/games/ninja/script.js`
  - `node public/games/ninja/tests/logic.test.js`
  - `npm.cmd run build`

## 9. 구현 메모
- 현재 코드베이스에는 `transitionAfterBossDefeat()`에 죽은 코드가 남아 있으므로, 이후 `/nh:make`에서 정리 대상 후보로 본다.
- 다만 이번 단계에서는 기존 동작 보존이 우선이므로, 공통 전환 체인을 깨지 않는 범위에서만 보강한다.
