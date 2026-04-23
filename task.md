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
