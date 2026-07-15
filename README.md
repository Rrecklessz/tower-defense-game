# Warcraft TD

A 3D browser tower defense game built with Three.js. WoW-inspired races, isometric camera, full gore effects.

## Run locally
```
node server.js
```
Then open http://localhost:3000

## Project structure
```
index.html      — Main HTML entry point
css/main.css    — All styles
js/data.js      — Game data (races, towers, enemies, waves)
js/terrain.js   — 3D terrain, trees, rocks, torches, portals
js/towers.js    — Tower 3D mesh builder
js/enemies.js   — Enemy + hero 3D mesh builder
js/combat.js    — Projectiles, particles, blood effects
js/ui.js        — HUD, shop, hero panel, combo, boss bar
js/game.js      — Main game loop, Three.js setup, wave logic
server.js       — Local dev server
```

## Races
- 🌲 Night Elves (Alliance) — slows, nature magic
- ✨ Blood Elves (Alliance) — arcane, highest DPS
- 🪓 Orcs (Horde) — cheap, brutal splash
- ☠️ Undead (Horde) — poison DoT, frost

## How to play
1. Pick a race
2. Place towers on green tiles — tap to place, tap again to upgrade
3. Use the War Council shop between waves for permanent upgrades
4. Place your Hero for bonus DPS
5. Survive all 10 waves
