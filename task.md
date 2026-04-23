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

## Ninja stage advance hardening
- Symptom:
  - Stage transitions could be re-broken by follow-up edits when delayed callbacks and watchdog cleanup were not treated as one transition unit.
- Work:
  - Added explicit cleanup for stage-clear UI and pending delayed events before starting the next scene.
  - Kept `startNextStageScene()` as the single stage-start entry point and preserved the `stageAdvanceStarted` duplicate-start guard.
  - Added regression tests for duplicate scene starts and cleanup of leftover stage advance state.
- Verification:
  - `node --check public/games/ninja/script.js`
  - `node public/games/ninja/tests/logic.test.js`
