# Ninja Game Architecture Map

## Main Scenes
- `PreloadScene`: load assets and generate dot textures
- `TitleScene`: entry point
- `SelectScene`: character selection
- `StoryScene`: mission briefing
- `GameScene`: gameplay loop and stage progression

## Core Systems
- Input system: keyboard + touch virtual keys
- Combat system: basic attack + Q skill + E character skill
- Stage system: stage transitions, portals, boss rooms
- UI system: HP/LIFE/cooldown/exit prompt
- Audio system: BGM manager + speech narration
