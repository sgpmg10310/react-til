# NH Ninja V10.0 시스템 구성도

## 1. 씬 구조
- `PreloadScene`: 배경 이미지와 도트 텍스처 생성
- `TitleScene`: V10 타이틀 진입
- `SelectScene`: 캐릭터 선택
- `StoryScene`: 3막 작전 브리핑
- `GameScene`: 전투, 방 진입, 유물 아이템, 보스 루프

## 2. 주요 시스템
- 입력 시스템: 키보드 + 모바일 터치 버튼 + 포커스 이탈 입력 초기화
- 전투 시스템: 쿠나이, 캐릭터 Q/E 기술, ITEM 유물 기술
- 스테이지 시스템: 제단 방, 성채 아이템 캐시, 포털 방, 보스 해금
- 안정화 시스템: 모바일 프로필, 파티클 축소, 적/하트 제한, 스케일 `FIT`
- 오디오 시스템: `public/games/ninja/bgm-manager.js` 기반 스테이지 랜덤 BGM 선택
- 전환 안정화 시스템: `freezeGameplayForStageAdvance()` + `stageAdvanceTicket` + `stageAdvancePending`

## 3. 흐름
`Stage1 Main Route -> Shrine Room -> Boss -> Stage2 Cache -> Dragon Room -> Stage3 Portal Room -> Crimson Mask -> Final Boss`
