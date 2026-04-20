# 상세 구현 설계서 (add.md): Nh Ninja V9.3 "Uchiha's Awakening"

## 1. 아트 및 에셋 설계 (Dot Design)

### 1.1 만화경 사륜안 (Mangekyou Sharingan) - 24x24
- **이미지 참조:** `만화경.png`의 붉은 안구와 곡선형 검은 날개 반영.
- **컬러 팔레트:**
  - `R`: #CC0000 (베이스 붉은색)
  - `K`: #000000 (검은 무늬 및 외곽선)
  - `.`: 투명
- **도트 맵 (Matrix):**
```javascript
[
  "........KKKKKKKK........",
  "......KKRRRRRRRRKK......",
  "....KKRRRRRRRRRRRRKK....",
  "...KRRRRRRKKKKRRRRRRK...",
  "..KRRRRRKKKKKKKKRRRRRK..",
  "..KRRRRKKKK..KKKKRRRRK..",
  ".KRRRRRKK......KKRRRRRK.",
  ".KRRRRKK........KKRRRRK.",
  "KRRRRRKK........KKRRRRRK",
  "KRRRKKKK...KK...KKKKRRRK",
  "KRRRKKKK..KKKK..KKKKRRRK",
  "KRRRRKKK..KKKK..KKKRRRRK",
  "KRRRRKKK..KKKK..KKKRRRRK",
  "KRRRKKKK..KKKK..KKKKRRRK",
  "KRRRKKKK...KK...KKKKRRRK",
  "KRRRRRKK........KKRRRRRK",
  ".KRRRRKK........KKRRRRK.",
  ".KRRRRRKK......KKRRRRRK.",
  "..KRRRRKKKK..KKKKRRRRK..",
  "..KRRRRRKKKKKKKKRRRRRK..",
  "...KRRRRRRKKKKRRRRRRK...",
  "....KKRRRRRRRRRRRRKK....",
  "......KKRRRRRRRRKK......",
  "........KKKKKKKK........"
]
```

## 2. 연출 및 시스템 설계

### 2.1 메인 화면 사륜안 인트로 (`TitleScene`)
- **객체:** `sharingan_intro` (scale: 0.1 -> 5.0)
- **애니메이션:** 
  1. `alpha: 0 -> 1` (Duration: 1000ms)
  2. `angle: 0 -> 720` (Duration: 1500ms)
  3. `scale: 0.1 -> 1.0` (Ease: 'Cubic.out')

### 2.2 사스케 전용 스킬 (`useSkill`)
- **트리거:** `charData.id === 's'` 일 때 `Q` 입력.
- **연속 동작:**
  1. **배경 필터:** `add.rectangle` (color: 0xff0000, alpha: 0.5) 생성.
  2. **트윈:** 필터 알파 값을 0.5에서 0으로 1000ms 동안 페이드아웃.
  3. **프로젝타일:** 거대한 `sharingan` 스프라이트 생성.
     - `angle` 트윈을 주어 회전시키며 전방으로 `setVelocityX(2000)`.
  4. **광역 살상:** `enemies.getChildren().forEach(e => e.destroy())`.
  5. **파티클:** 모든 적 위치에서 검은색(`0x000000`) 아마테라스 불꽃 파티클 생성.

## 3. 단위 테스트 설계
- **사스케 스킬 검증:** 사스케로 스킬 사용 시 `enemies` 그룹의 `countActive()`가 0이 되는지 확인.
- **필터 검증:** 스킬 사용 직후 특정 좌표의 색상 값이 붉은색 보정을 받는지(알파값 존재 여부) 가상 검증.
- **인트로 검증:** `TitleScene` 시작 시 `sharingan` 키를 가진 이미지 객체가 생성되는지 확인.

---
**설계 완료.** 다음 단계인 `/nh:make` (구현) 단계로 진행합니다.
