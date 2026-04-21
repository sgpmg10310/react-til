# NH Result Stage

## Overview
- 이 문서는 NH Ninja V10.0의 최종 결과 요약입니다.
- 핵심 범위: 게임 시나리오, 게임 방법, Codex 아키텍처, 워크플로우 산출물.

## Game Scenario
1. Stage 1 `초원 전선`
   - 소용돌이 제단에 들어가 `청람 구슬`을 회수하고 전선대장을 격파합니다.
2. Stage 2 `폭풍 성채`
   - 천뢰 병기고에서 `천뢰 인장`을 확보한 뒤 드래곤 보스를 상대합니다.
3. Stage 3 `적월의 방`
   - 포털을 선택해 `적월 가면`을 회수하고 최종 보스를 해금합니다.

## How To Play
- 이동: `A / D` 또는 모바일 `BACK / GO`
- 점프/문 진입: `W / SPACE` 또는 모바일 `JUMP`
- 공격: `S` 또는 모바일 `KUNAI`
- 궁극기: `Q` 또는 모바일 `ULT`
- 전용기: `E` 또는 모바일 `TECH`
- 유물 스킬: `F` 또는 모바일 `ITEM`

## Codex Architecture
- Route Layer: `App.jsx -> /ninja-game-hub`
- Workflow Hub: `NinjaGameHubView`
- Runtime Layer: `public/games/ninja/index.html`
- Game Logic: `public/games/ninja/script.js`
- Workflow Docs: `plan.md`, `add.md`, `make.md`, `fun.md`, `qa.md`, `result.md`
