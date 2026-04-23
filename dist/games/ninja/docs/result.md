# NH Ninja Result Stage

## Overview
- 이 문서는 현재 구현된 나루토 닌자 맛 게임의 시작 허브 기준 최종 결과 요약입니다.
- 범위: 게임 스토리, 실제 플레이 루프, 허브 산출물, 런타임 연결 구조.

## Game Scenario
1. Stage 1 `초원 전선`
   - 소용돌이 제단에 들어가 `청람 구슬`을 확보하고 전선 보스를 격파합니다.
2. Stage 2 `천뢰 성곽`
   - 병기고에서 `천뢰 인장`을 확보한 뒤 성문을 넘어 드래곤 방으로 진입합니다.
3. Stage 3 `적월의 방`
   - 포털을 선택해 시험의 방으로 들어가 `적월 가면`을 회수하고 최종 보스를 해금합니다.

## Current Play Flow
- 기본 루프: 전진 -> 방 진입 -> 유물 확보 -> ITEM 스킬 해금 -> 보스 격파 -> 다음 스테이지 전환
- 목표 안내: 게임 중 `MISSION` 문구가 스테이지 상태에 따라 현재 목표를 갱신합니다.
- 전환 안정성: 보스 처치 후 `stageAdvanceTicket`과 단일 `scene.start` 진입점으로 다음 스테이지 이동을 보장합니다.

## Controls
- 이동: `A / D` 또는 모바일 조이스틱
- 점프 및 방 진입: `W / SPACE` 또는 `JUMP`
- 기본 공격: `S`
- 전투 스킬: `Q`
- 캐릭터 특수 기술: `E`
- 유물 스킬: `Shift` 또는 모바일 `ITEM`

## Hub Outputs
- `plan.md`
- `add.md`
- `make.md`
- `fun.md`
- `qa.md`
- `result.md`
- `system_map.md`
- `game-map.md`
- `architecture-map.md`
- `workflow-result.md`

## Runtime Map
- Route Layer: `App.jsx -> /ninja-game-hub`
- Workflow Hub: `src/pages/NinjaGameHubView.jsx`
- Runtime Entry: `public/games/ninja/index.html`
- Game Logic: `public/games/ninja/script.js`
- Reference Docs: `public/games/ninja/docs/*`
