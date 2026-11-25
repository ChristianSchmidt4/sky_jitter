# AGENTS.md – Agent Guidelines & Rules

This file contains **mandatory rules** for every AI agent working on this project.
Agents MUST read and follow these rules before making any changes.

---

## 1. Versioning (AUTOMATIC)

Every `git commit` MUST increment the **minor version** in `package.json`.

**Algorithm:**
1. Read current version from `package.json` (`"version": "X.Y"`)
2. Increment `Y` by 1 (e.g. `0.1 → 0.2`)
3. Update `package.json` with the new version
4. `git add package.json` so the change is included in the same commit

**Example commit message prefix:** `feat: …` / `fix: …` / `chore: …`

**Do NOT skip this step — it is mandatory.**

---

## 2. Project Overview

| Property | Value |
|----------|-------|
| **Name** | Sky Jitter |
| **Genre** | Arcade space shooter (Bats-style) |
| **Target** | Web browser, iPhone 11 (iOS Safari), PWA |
| **Format** | Landscape 960×540 |
| **Stack** | TypeScript + Phaser 4 + Vite |

---

## 3. Mandatory Rules

1. **Always read `AGENTS.md` before making changes.**
2. **Every commit must increment the minor version in `package.json`.**
3. **Run `npm run typecheck` before every commit.** All TypeScript errors must be fixed before committing.
4. **All UI text MUST come from i18n files only** (`src/i18n/de.json`, `src/i18n/en.json`). Never hardcode text.
5. **Keep all sprites procedural** — use Phaser Graphics, no external image assets.
6. **Test for iPhone 11 (iOS Safari):** touch controls, gyro, fullscreen, 60 FPS.
7. **No server dependencies.** Everything runs in the browser.
8. **Add new features to `PROMPTS.md` section 6** (prompt history table).
9. **Update documentation** (`README.md` + `PROMPTS.md`) after any feature change.

---

## 4. Architecture Overview

- **Entry:** `src/main.ts` — Phaser init, sensor permission, event dispatch
- **Scene:** `src/scenes/GameScene.ts` — all game logic, input, collisions, HUD
- **Sprites:** `src/game/sprites.ts` — procedural texture baking
- **Weapons:** `src/game/weapons.ts` — weapon levels 1–10
- **Audio:** `src/audio/audio.ts` + `music.ts` — Web Audio API (chiptune)
- **i18n:** `src/i18n/` — German + English
- **Background:** `src/game/background.ts` — parallax stars + nebula
- **PWA Update:** `src/game/update-system.ts` — service worker update detection, banner UI
- **Wake Lock:** `src/game/wake-lock.ts` — prevents screen sleeping during gameplay (Wake Lock API + CSS fallback)

---

## 5. Key Constants (do not change without reason)

| Constant | Default | Notes |
|----------|---------|-------|
| `W` / `H` | 960 × 540 | Fixed game resolution |
| `MAX_LEVEL` | 50 | Total levels |
| `BOSS_EVERY` | 5 | Boss at levels 5, 10, … 50 |
| `MAX_WEAPON_LEVEL` | 10 | Max weapon upgrade |
| `START_LIVES` | 5 | Starting lives |
| `PLAYER_SHIELD_MAX` | 100 | Shield 0–100% |
| `PLAYER_SPEED` | 380 | Horizontal px/s |
| `PLAYER_Y_SPEED` | 220 | Vertical px/s |
| `BULLET_SPEED` | 620 | Player bullet px/s |
| `SHOT_DAMAGE` | 35 | Damage per shot |
| `RESPAWN_INVULN_S` | 1.5 | Respawn invincibility |

---

## 6. Enemy Types

| Type | Min Level | HP | Points | Firing Pattern |
|------|-----------|----|--------|---------------|
| `enemyBug` | 1 | 3 | 100 | Straight shots |
| `enemySaucer` | 3 | 5 | 250 | Straight + homing rockets |
| `enemyFighter` | 6 | 7 | 400 | Straight + homing rockets |
| `enemyLaser` | 8 | 5 | 300 | **Tracking laser** (3 shots toward player) |
| `enemyDouble` | 14 | 9 | 500 | **Double-barrel** (2 parallel shots, offset left/right) |

**Difficulty scaling:** HP +35%/level, fire rate +55%, shot speed +3/level.
**Enemy tint:** white → yellow → orange → red → purple → white-hot by level.

---

## 7. Boss Mechanics

- Spawn every 5 levels, no regular enemy waves.
- HP: `300 + 80 × level`
- Color progression: white → purple → magenta → red → blue → cyan → gold → blood red
- Attack patterns escalate: straight → diagonal → side → all directions
- Boss rockets: 2–8 homing missiles per salvo, every 3.5 s
- Helpers: 2 new enemies every 6 s (max 8)
- Death: 2000 pts, shield recharge + missile widget, clears all enemies/rockets

---

## 8. Development Workflow

```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run typecheck    # TypeScript check
npm run test         # Playwright tests
npm run build:github # GH Pages build
```

Use `?level=N` URL parameter to skip to a specific level for testing.
Weapon level is auto-calculated: `Math.round(level × 1.5)` (max 10).

---

## 9. iOS PWA Audio

- AudioContext must be unlocked via `audio.unlock()` inside a **user gesture** (pointerdown/click).
- `deviceorientation` event requires `requestPermission()` on iOS 13+.
- `devicemotion` (shake) also requires `requestPermission()` on iOS.
- Never use `visibilitychange` to resume audio — it's not a user gesture on iOS.

---

## 10. PWA Configuration

The project uses **Vite PWA plugin** (`vite-plugin-pwa`) configured in `vite.config.ts`.

### Key settings
- `registerType: 'autoUpdate'` — SW calls `skipWaiting()` when a new SW is available
- `injectRegister: 'auto'` — registers the service worker automatically
- Icons and manifest are embedded in the Vite config (no separate manifest file needed)

### Update detection
- `src/game/update-system.ts` — listens for `controllerchange` and `visibilitychange` events
- Shows an **update banner** (`#update-banner`) with "Update available!" and "Restart to update"
- Banner dismisses on tap outside the button; clicking the button reloads the page to apply the new SW
- The banner is in both languages (i18n keys: `updateAvailable`, `updateRestart`)

### Version tracking
- Version is defined in `package.json` (`"version": "X.Y"`) and injected at build time as `__APP_VERSION__`
- Displayed in the start overlay and in the update banner
- Every commit MUST increment the minor version (see section 1)

### iOS considerations
- PWA icons must be in `public/icons/` (apple-touch-icon.png, maskable-512.png, icon-512.png)
- `display: 'standalone'` in manifest makes the app launch full-screen
- `orientation: 'landscape'` locks to landscape mode

### Screen wake lock (prevent screen sleeping)
- `src/game/wake-lock.ts` — `Wake Lock API` for Chrome/Edge/Android, CSS animation fallback for Safari
- `wakeLockOn()` called on game start and when un-pausing; `wakeLockOff()` on game over / pause / tab hidden
- The CSS fallback (`#wake-lock-fallback`) is a hidden element that continuously animates, which tricks iOS Safari into keeping the screen alive
- iOS Safari does not support `navigator.wakeLock` — the CSS animation is the only reliable way to prevent sleep on iOS
- When the tab becomes hidden, both the Wake Lock and the CSS fallback are released to save battery

---
