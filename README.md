# Warcraft TD 🏰

A 3D browser tower defense game with WoW-inspired races, isometric 3D camera, hero units, gore effects and synthesized sound.

## 📁 Project Structure

```
warcraft-td/
│
├── index.html          ← THE GAME (everything is here — open this in browser)
├── server.js           ← Local dev server
├── push.bat            ← Push to GitHub (Windows — double click)
├── push.sh             ← Push to GitHub (Mac/Linux)
├── README.md
│
├── css/
│   └── main.css        ← Styles for the multi-file version (future use)
│
└── js/                 ← Separate modules (future use / reference)
    ├── data.js         ← Race, tower, enemy, wave data
    ├── terrain.js      ← 3D world builder
    ├── towers.js       ← Tower 3D mesh builder
    ├── enemies.js      ← Enemy + hero mesh builder
    ├── combat.js       ← Projectiles, particles, blood
    ├── ui.js           ← HUD, shop, hero panel, combo
    ├── game.js         ← Main loop + Three.js setup
    └── hero.js         ← Hero class with abilities
```

> **Note:** The working game is `index.html` — it's self-contained. The `js/` folder files are for reference and future splitting.

## 🚀 Run Locally

```bash
node server.js
```
Open → http://localhost:3000

## 🎮 How to Play

1. **Pick a race** — each has 4 unique towers
2. **Tap green tiles** to place towers
3. **Tap a placed tower** to upgrade it (60g, max level 3)
4. **Tap 🪙 Sell** then tap a tower to sell for half price
5. **Place your Hero** — auto-attacks, levels up, gains abilities
6. **War Council shop** opens between waves — buy permanent upgrades
7. Survive all **10 waves** to win

## ⚔️ Races

| Race | Faction | Specialty |
|------|---------|-----------|
| 🌲 Night Elves | Alliance | Slows, nature chains, long range |
| ✨ Blood Elves | Alliance | Highest DPS, arcane splash |
| 🪓 Orcs | Horde | Cheap, brutal catapult splash |
| ☠️ Undead | Horde | Poison DoT, frost nova chains |

## 🏗️ Tower Types (per race)

Each race has 4 towers:
- **Basic** — cheap, reliable single target
- **AoE** — splash damage or slowing
- **Chain** — hits multiple enemies
- **Sniper** — longest range, highest single shot

## 🦸 Heroes

| Race | Hero | Ability |
|------|------|---------|
| Night Elves | Malfurion | Entangling Roots — roots all nearby enemies |
| Blood Elves | Kael'thas | Pyroblast — massive AoE fireball |
| Orcs | Thrall | Chain Lightning — jumps 6 enemies |
| Undead | Arthas | Frost Nova — freezes all in range |

## 💰 Economy

- Kill enemies for gold
- Earn **8% interest** on saved gold between waves
- **Combo kills** multiply gold rewards (up to 5×)
- War Council shop: permanent upgrades between waves

## 🔊 Sound

All sounds are synthesized with Web Audio API — no audio files needed. Sounds unlock on first tap.

## 📱 Push to GitHub

**Windows:** Double-click `push.bat`

**Mac/Linux:**
```bash
./push.sh
```

Or manually:
```bash
git add .
git commit -m "Your message"
git push
```

## 🌐 Deploy Free (GitHub Pages)

1. Go to your repo on GitHub
2. Settings → Pages → Source: `main` branch, `/ (root)` folder
3. Save — your game will be live at:
   `https://Rrecklessz.github.io/tower-defense-game`

Share that link on TikTok to get players!
