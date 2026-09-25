# Task Log (2026-04-23)

## Ninja boss clear rollback recovery
- Symptom:
  - After clearing the boss in the Naruto ninja game, the stage clear state could remain stuck instead of entering the next stage.
- Work:
  - Restored the boss-clear transition path to `goToNextStage()` and re-added `startStage2AfterStage1Boss()` for the stage 1 boss flow.
  - Kept the watchdog ticket and protected transition lock so delayed callbacks and forced fallback share the same scene entry.
  - Added a lightweight regression test for the 1.2s callback, 2.0s watchdog, and protected transition window.
- Verification:
  - `node --check public/games/ninja/script.js`
  - `node public/games/ninja/tests/logic.test.js`

## Ninja stage advance regression recovery
- Symptom:
  - Stage transitions were reported broken again even after earlier fixes, despite a previously working version existing.
- Work:
  - Compared the current transition code against the known-good boss stage advance commit and restored the core transition flow to that working path.
  - Kept the verified chain `handleEnemyDefeat() -> goToNextStage() -> stageAdvanceTicket -> startNextStageScene()`.
  - Retained the duplicate-start regression test so delayed callbacks and watchdog fallback still converge on one scene start.
- Verification:
  - `node --check public/games/ninja/script.js`
  - `node public/games/ninja/tests/logic.test.js`

## /nh:qa boss stage transition verification
- Scope:
  - Re-verify stage 1 -> 2 -> 3 boss-clear transitions for all characters through the shared runtime path.
- Work:
  - Re-compared the live transition code with the previously working commit `443d80b`.
  - Confirmed `GameScene.init()` still applies `data.stage` and that build output was regenerated after the recovery.
- Verification:
  - `node --check public/games/ninja/script.js`
  - `node public/games/ninja/tests/logic.test.js`
  - `npm.cmd run build`
  - `node --check dist/games/ninja/script.js`
# Task Log (2026-04-23)

## /nh:plan stage 1 boss transition race hardening
- Symptom:
  - Stage 1 boss HP could reach 0, but the screen could remain stuck before entering stage 2.
- Sub-agent assessment:
  - The transition path itself was still connected.
  - The likely failure was a post-kill race between boss destruction and the delayed next-scene start.
- Work:
  - Added `stageAdvancePending` so boss-clear stage advances lock immediately at defeat time.
  - Blocked damage while a boss-clear transition is pending, even if the boss sprite is already inactive.
  - Added a regression test for the post-kill protection window.
- Verification:
  - `node --check public/games/ninja/script.js`
  - `node public/games/ninja/tests/logic.test.js`

## /nh:make boss clear freeze + random stage bgm
- Symptom:
  - After hitting a boss, the clear frame could continue scrolling and score events could keep happening instead of cleanly handing off to the next stage.
  - Stage-specific BGM was also being overridden back to the default battle loop.
- Work:
  - Added `freezeGameplayForStageAdvance()` and wired it into `goToNextStage()` so clear transitions now stop movement, gravity, enemy spawns, and lingering combat objects.
  - Guarded enemy damage and spawn paths during `stageAdvancePending`.
  - Split BGM management into `public/games/ninja/bgm-manager.js` and added random stage-theme variants selected via `syncStageBgm()`.
- Verification:
  - `node --check public/games/ninja/script.js`
  - `node --check public/games/ninja/bgm-manager.js`
  - `node public/games/ninja/tests/logic.test.js`
  - `./node_modules/.bin/eslint public/games/ninja/script.js public/games/ninja/bgm-manager.js public/games/ninja/tests/logic.test.js`
  - `npm run build`

## /nh:make naruto boss transition watchdog hardening
- Symptom:
  - Naruto character reports still reproduced boss-clear softlocks where the next stage did not start after the boss died.
- Work:
  - Added a wall-clock stage-advance fallback independent of Phaser scene time.
  - Re-triggered forced stage advance on visibility recovery.
  - Registered transient cleanup for Naruto `라센간` and the stage1 relic orb so transition freeze removes independent overlap/timer objects too.
  - Added explicit one-time boss defeat sentinel handling and transition guards on attack entry points.
- Verification:
  - `node --check public/games/ninja/script.js`
  - `node public/games/ninja/tests/logic.test.js`
  - `./node_modules/.bin/eslint public/games/ninja/script.js public/games/ninja/tests/logic.test.js`
  - `npm run build`
  - `node --check dist/games/ninja/script.js`
  - `node dist/games/ninja/tests/logic.test.js`

## /nh:make 한글 게임 그림-단어 불일치 해결 (2026-09-24)
- Symptom:
  - 단어 480개가 그림 346개를 나눠 써서 212개 단어가 같은 그림을 공유 → 3·6번 퀴즈에서 맞아 보이는 보기가 2개 이상.
  - 같은 단어가 두 번 들어가 뒤 값이 덮어씀(배🍐→🚢, 밤🌰→🌃 등 13건), 뜻과 다른 그림(무🥕, 비☔ 등).
  - 1번에서 사전에 없는 글자에 무작위 그림 표시. 3·6번은 틀려도 고른 단어를 읽지 않음. 3번은 정답 후 연타 시 두 번 넘어감.
- Work:
  - 단어장을 그림 1개 = 단어 1개로 정리 (Codex 세션, 47523d3), 포함 관계 단어 정리 (새/비둘기, 공→축구 등, 8e831c6, d8953cb, 782db6e). 최종 265개.
  - `hashEmoji`·✨ 대체 그림 제거, `getEmojiForWord`는 사전에 없으면 null.
  - `playWrongJingleThenSay(word)` 추가 (1d0d4be), 3·6번 오답 시 고른 단어 읽기 (bb5f3a6, c7eefc3).
  - 1번은 사전 단어만 그림 표시 (89e5875), 3번 정답 후 버튼 잠금 (bb5f3a6).
- Verification:
  - `npm test` (Node 20) → 3 files, 12 passed
  - `npx eslint src/data src/components/hangul src/pages/game1 src/pages/game3 src/pages/game6 --ext js,jsx` → 0 errors (기존 JSX 오탐 경고 7개 그대로)
  - `npx vite build --outDir <임시폴더>` → 성공

## /nh:make 한글 게임 캐릭터 목소리 + 배경음 OFF 오답 무음 버그 (2026-09-25)
- Symptom:
  - 배경음을 `🔇 배경음 OFF`로 두면 3·6번에서 틀려도 아무 소리가 나지 않음 (정답 소리는 들림).
  - 원인: 오답 징글·오답 읽기가 배경음 음소거 값(`hangul-bgm-muted`)을 같이 봄.
  - 요청: 목소리를 유튜버 느낌으로 (실제 인물 음성 복제는 퍼블리시티권·약관 문제로 제외, 오리지널 캐릭터로).
- Work:
  - `src/components/hangul/hangulVoice.js` 추가: CHARACTER(1.4/1.15)·WORD(1.1/0.95) 두 목소리, `sayWord`/`sayLine`/`sayCorrect`/`sayWrong`/`stopVoice`, 대사 3개씩 연속 중복 없이, 설치된 한국어 목소리 우선 (67873e9, e46ad42).
  - 배경음 OFF와 무관하게 오답 징글·목소리 재생 (628c069).
  - 1·3·4·5번의 복사된 `playTTS`/`playSound` 제거하고 모듈 사용, 5번 "~네요" 조사 오류 수정 (f4f206e, f1cac10).
  - 6번 새 문제 시작 때·3/6번 화면 나갈 때 목소리 멈춤 (e46ad42).
- Verification:
  - `npm test` (Node 20) → 4 files, 22 passed
  - 고친 파일 lint → 0 errors (기존 JSX 오탐 경고만)
  - `npx vite build --outDir <임시폴더>` → 성공
