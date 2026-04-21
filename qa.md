# 품질 감사 보고서 (qa.md): NH Ninja V10.0

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
