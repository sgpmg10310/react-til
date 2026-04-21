# [헌법] 프로젝트 개발 및 품질 관리 규칙

(내용은 GEMINI.md와 동일하게 6단계 워크플로우로 동기화됨)

## 1. 개요 및 철학
... (상동) ...

## 2. 6단계 표준 워크플로우
... (상동) ...

## 운영 보강 기록 (2026-04)
- NH Ninja 보스 처치 후 스테이지 전환 안정화:
  - 보스 처치 시 `goToNextStage()`/`startStage2AfterStage1Boss()`를 즉시 트리거.
  - 전환 연출 중 피격 방지(`roomTransitionLocked`, `protectedUntil`) 적용.
  - **전환 티켓(`stageAdvanceTicket`) 워치독**을 추가해 지연 콜백 누락/중단 시에도 강제로 다음 스테이지로 이동.
- 원칙:
  - 기존 기능을 깨지 않는 보강 방식으로 수정한다.
  - 단계 전환은 단일 진입점 + 안전장치(워치독)로 관리한다.
  - 변경 후 `qa.md`와 `.gemini/plan/task.md`에 기록을 남긴다.
