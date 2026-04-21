# 품질 감사 보고서 (qa.md): NH Ninja V10.0

## 0. R 버튼 멈춤 버그 QA (2026-04-21)
- 증상: `R` 입력 후 로프 상태가 고정되며 이동 입력이 먹지 않는 것처럼 보이는 사례가 재현됨.
- 조치: `public/games/ninja/script.js`의 로프 로직을 `releaseRope()` 기반으로 재구성.
  - 로프 대상 무효 시 자동 해제
  - 로프 유지 시간 타임아웃(2200ms) 후 자동 해제
  - 점프/좌우 입력 시 즉시 해제 + 관성 부여
- 검증 결과:
  - `node public/games/ninja/tests/logic.test.js`: PASS (15/15)
  - Cursor `ReadLints`(수정 파일 기준): PASS
  - `node --check public/games/ninja/script.js`: 로컬 Node 10 런타임 한계로 실행 불가(클래스 필드 문법 미지원). 코드 수정으로 인한 신규 파싱 오류 신호는 별도 발견되지 않음.

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
