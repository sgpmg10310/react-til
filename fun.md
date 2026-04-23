# 재미 검증 보고서 (fun.md): NH Ninja V10.0

## 1. 시나리오 재미
- 단순 점수 러너가 아니라 "방 진입 -> 유물 확보 -> 전투 방식 확장" 흐름으로 바뀌어, 플레이 이유가 선명해졌습니다.
- 스테이지 3은 먼저 가면을 가져와야 보스가 깨어나는 구조라 긴장감이 생깁니다.

## 2. 전투 재미
- 캐릭터 고유기(Q/E)와 유물 기술(ITEM)이 분리되어, 전투 리듬이 더 풍부해졌습니다.
- 청람/천뢰/적월 스킬은 각각 투사체, 라인 관통, 광역 방어로 역할이 달라 선택감이 생깁니다.
- 보스전도 스테이지마다 읽는 방식이 달라졌습니다. 전선대장은 돌진과 부채꼴 견제, 용은 브레스와 돌진, 악몽은 순간이동과 환영 탄막으로 대응 감각이 달라집니다.

## 3. 모바일 UX
- 이전 문자형 터치 입력보다 버튼의 의도가 분명합니다.
- 이동과 점프가 좌측에 고정되고, 공격과 기술이 우측에 모여 있어 한 손씩 역할을 나누기 쉽습니다.
- 방 탈출 직후 즉사하지 않도록 보호 상태를 넣어, 모바일에서도 흐름이 훨씬 자연스럽습니다.

## 4. Stage 2 연출 재미 보강 (2026-04-22)
- 2탄 진입 시 배경을 어둡고 비 내리는 폭풍 분위기로 전환해 스테이지 체감 구분이 더 선명해졌습니다.
- 천뢰 병기고를 단순 박스가 아닌 성문형 입구로 바꿔 탐험 동기가 강화됐습니다.
- 입구 안내 문구를 추가해 유물 회수 목표가 직관적으로 전달됩니다.
## 5. /nh:fun Boss Clear Flow Value Check (2026-04-23)
- Boss clear should feel like payoff, not uncertainty.
  - The player now gets a consistent clear beat after the final hit instead of a possible dead frame or failed scene hop.
- The post-kill protection window improves fairness.
  - When a boss dies, leftover hitboxes or collision timing no longer steal the win with a last-frame death.
- Stage rhythm is clearer.
  - Stage 1 boss defeat leads into `STAGE 1 CLEAR` and stage 2 immediately, so the map-change reward lands while player tension is still high.
- UX value:
  - The transition lock and watchdog are not just technical safety nets; they preserve emotional continuity between boss defeat, banner, and next map reveal.
- Residual note:
  - `transitionAfterBossDefeat()` still contains commented legacy body residue in runtime code, so the current fun value is preserved, but future cleanup would further reduce maintenance risk.
