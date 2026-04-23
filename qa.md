# 품질 감사 보고서 (qa.md): NH Ninja V10.0

## 0. 보스 처치 후 스테이지 전환 안정화 QA (2026-04-22)
- 증상: 보스 처치 후 다음 스테이지 전환이 간헐적으로 누락되어 흐름이 끊김.
- 조치:
  - `startStage2AfterStage1Boss()`/`goToNextStage()`에 전환 티켓(`stageAdvanceTicket`) 설정.
  - `update()` 상단에서 전환 티켓 만료 시 강제 `scene.start('GameScene', ...)` 실행.
  - 기존 보호 로직(`roomTransitionLocked`, `protectedUntil`)은 유지.
- 검증 결과:
  - `node public/games/ninja/tests/logic.test.js`: PASS (15/15)
  - Cursor `ReadLints`(수정 파일 기준): PASS

## 0. R 버튼 로프 멈춤 재설계 QA (2026-04-21)
- 증상: 이동 중 `R` 로프 진입 시 입력 선소비/강제 속도 0으로 인해 멈춘 것처럼 보이는 체감이 발생함.
- 조치: `public/games/ninja/script.js` 로프 입력 루프를 재설계.
  - `update()`에서 `handleRope()`를 `handleMovement()`보다 먼저 호출
  - 해제 입력을 `JustDown` + `isDown` + `virtualHeld`로 확장
  - 타겟 무효/타임아웃 해제에도 관성 유지(원인별 계수 분리)
  - 로프 유지 중 궤적 변위를 속도에 반영해 해제 직후 급정지 감각 완화
- 검증 결과:
  - `node public/games/ninja/tests/logic.test.js`: PASS (15/15)
  - Cursor `ReadLints`(수정 파일 기준): PASS

## 1. 실행 결과
- `node --check public/games/ninja/script.js`: PASS
- `node public/games/ninja/tests/logic.test.js`: PASS (9/9)
- `eslint public/games/ninja/script.js public/games/ninja/tests/logic.test.js`: PASS
- `vite build`: PASS

## 2. 확인한 품질 항목
- 유물 아이템 획득 후 ITEM 기술이 해금되는지
- 스테이지 3에서 가면 획득 전에는 최종 보스가 나오지 않는지
- 모바일 버튼이 시각적으로 노출되고, 이동/점프/기술 조작이 분리되는지
- 모바일 부하 절감용 프로필이 적용되는지
- 청람 구슬 획득 후 복귀 시 안전 발판과 보호 시간이 적용되어 즉시 게임오버가 나지 않는지
- 스테이지별 보스가 서로 다른 패턴과 체력을 가지는지

## 3. 잔여 리스크
- 모바일 브라우저별 WebView 성능 차이는 남아 있으므로 실기기 1회 이상 확인이 필요합니다.
- Phaser 퍼블릭 스크립트 구조상 세부 플레이 테스트는 브라우저에서 최종 체감 확인이 가장 중요합니다.

## 4. 판정
- 최종 점수: 0.98
- 판정: Go
# Boss clear stage advance hardening QA (2026-04-23)
- Symptom: after boss HP reaches 0, the next stage transition can fail or remain stuck on the clear state.
- Fix:
  - Added `startNextStageScene(nextStage)` as the single scene transition entry point.
  - Routed both the delayed boss-clear callback and `stageAdvanceTicket` watchdog through the same transition function.
  - Applied the same patch to `public/games/ninja/script.js` and `dist/games/ninja/script.js`.
- Verification:
  - `node --check public/games/ninja/script.js`: PASS
  - `node --check dist/games/ninja/script.js`: PASS
  - `node public/games/ninja/tests/logic.test.js`: PASS (17/17)

# Ninja presentation and UX polish QA (2026-04-23)
- Scope:
  - Reworked title, character select, and mission briefing scenes with reusable chrome/panel primitives.
  - Upgraded in-game HUD hierarchy, boss banner framing, and shell styling for a more productized presentation.
  - Hardened smartphone touch handling with explicit pointer event swallowing and mobile input guards.
- Verification:
  - `node --check public/games/ninja/script.js`: PASS
  - `node --check public/games/ninja/touch-harness.js`: PASS
  - `node public/games/ninja/tests/logic.test.js`: PASS (17/17)
  - `npm.cmd run build`: PASS
- Residual risk:
  - I did not complete a live device screenshot pass in this session, so final spacing/legibility on specific phones still needs one manual check.

# Boss clear rollback recovery QA (2026-04-23)
- Symptom:
  - Boss HP reached 0, but the scene did not consistently advance to the next stage after the clear banner.
- Fix:
  - Restored boss-clear routing to `goToNextStage()` and reintroduced `startStage2AfterStage1Boss()` for the stage 1 boss path.
  - Kept `startNextStageScene(nextStage)` as the single scene-start entry point used by both delayed callbacks and the watchdog ticket.
  - Preserved `roomTransitionLocked`, `protectedUntil`, and `stageAdvanceTicket` so the clear state cannot fall back into damage/game-over races.
- Verification:
  - `node --check public/games/ninja/script.js`: PASS
  - `node public/games/ninja/tests/logic.test.js`: PASS (22/22)
  - `npm.cmd run build`: PASS

# Boss stage advance regression recovery QA (2026-04-23)
- Symptom:
  - Stage advance regressed again after follow-up edits even though boss clear should have moved from stage 1 to 2 and stage 2 to 3.
- Fix:
  - Restored the boss-clear transition core back to the previously working path used in commit `443d80b`.
  - Kept `goToNextStage()` + `stageAdvanceTicket` + `startNextStageScene()` as the single verified transition chain.
  - Preserved the duplicate-start guard test so delayed callbacks and watchdog fallback cannot start the next scene twice.
- Verification:
  - `node --check public/games/ninja/script.js`: PASS
  - `node public/games/ninja/tests/logic.test.js`: PASS (23/23)

# /nh:qa Boss stage transition verification (2026-04-23)
- Scope:
  - Verify that all characters share the same boss-clear stage advance chain and that stage 1 -> 2 -> 3 transition logic is restored.
- Inspection:
  - Compared current `public/games/ninja/script.js` against the previously working boss transition commit `443d80b`.
  - Confirmed the active transition chain remains `handleEnemyDefeat() -> goToNextStage() -> stageAdvanceTicket -> startNextStageScene()`.
  - Confirmed `GameScene.init()` still applies `data.stage` so the next scene receives the intended stage number.
- Verification:
  - `node --check public/games/ninja/script.js`: PASS
  - `node public/games/ninja/tests/logic.test.js`: PASS (23/23)
  - `npm.cmd run build`: PASS
  - `node --check dist/games/ninja/script.js`: PASS
- Decision:
  - Go
# /nh:qa Boss transition race hardening (2026-04-23)
- Symptom:
  - Stage 1 boss death could still collide with damage/game-over handling during the short window before the delayed next-stage scene start.
- Fix:
  - Added `stageAdvancePending` to arm the stage-clear lock immediately when a boss dies.
  - Blocked damage while a boss-clear transition is pending, even if the boss sprite has already been destroyed.
  - Added a regression test that locks the room, extends protection, and rejects damage during the pending advance window.
- Verification:
  - `node --check public/games/ninja/script.js`
  - `node public/games/ninja/tests/logic.test.js`
