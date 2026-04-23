# Ninja Game Architecture Map

## Main Scenes
- `PreloadScene`
- `TitleScene`
- `SelectScene`
- `StoryScene`
- `GameScene`

## Hub And Runtime
- Result Hub: `src/pages/NinjaGameHubView.jsx`
- Runtime Entry: `public/games/ninja/index.html`
- Main Logic: `public/games/ninja/script.js`

## Core Systems
- Input: keyboard + touch buttons + focus reset
- Combat: kunai, `Q`, `E`, ITEM relic skill
- Stage: shrine room, relic cache, portal room, boss unlock
- Objective UI: HP, cooldowns, boss bar, `MISSION` guide text
- Transition Safety: `goToNextStage()`, `startNextStageScene()`, `stageAdvanceTicket`

## Story Structure
- Stage 1: shrine entry -> blue relic -> field commander
- Stage 2: relic cache -> castle door -> dragon room
- Stage 3: portal room -> crimson mask -> final boss
