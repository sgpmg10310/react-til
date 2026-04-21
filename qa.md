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
