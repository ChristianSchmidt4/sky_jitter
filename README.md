# Sky Jitter
Arcade-Shooter im Querformat, optimiert für Smartphones (iPhone 11 / iOS Safari).
Gegner ausweichen, abschießen, Spezialwaffen sammeln – im Stil klassischer Bats-artiger Shooter.
## Installation & Start
```bash
npm install
npm run dev          # Vite-Devserver (localhost:5173)
npm run build        # Produktions-Build (tsc --noEmit && vite build)
npm run preview      # Build lokal testen
npm run typecheck    # Typprüfung (tsc --noEmit)
npm run check:syntax # Typprüfung (tsc --noEmit)
npm run build:github # Build für GitHub Pages (base /sky_jitter/)
npm test             # Playwright-Tests
```
Auf dem Gerät: Browser öffnen, „Zum Startbildschirm hinzufügen" für Vollbild-Modus.
## Steuerung
| Aktion | Mobil | Desktop |
|--------|-------|---------|
| Bewegen | Gerät neigen (Gyroskop) | Pfeiltasten ← → |
| Höhe | – | Pfeiltasten ↑ ↓ |
| Schießen | Tippen / Leertaste | Leertaste |
| Rakete | Schütteln (DeviceMotion) | X |
| Pause | P / Tippen auf „Pause" | P |
| Neustart | Tippen auf Overlay | R |
## Spielprinzip
- **50 Level** mit steigender Schwierigkeit.
- **Gegner** fliegen in Formationen von oben, weichen seitlich aus und feuern zurück.
- **Markierte Gegner** (12 % Chance) lassen **Raketen-Widgets** fallen.
- **Waffen-Upgrades** steigen automatisch mit dem Punktestand (alle 2500 Punkte) oder durch **Waffen-Widgets**.
- **Extraleben** alle 5000 Punkte.
- **Bosse** alle 10 Level mit eigenen Angriffsmustern.
- **Game Over** bei 0 Leben, **Sieg** nach allen 50 Leveln.
- Zwischen den Leveln gibt es eine kurze **Pause (Intermission)** von 1,6 s.
## Elemente
### Spieler-Schiff
- Start mit 5 Leben.
- **Schutzschild** (0–100 %): Zieht Treffer zuerst ab (35 Schaden pro Treffer). Bei 0 % wird ein Leben abgezogen, Respawn mit 1,5 s Unverwundbarkeit. Schutzschild-Treffer geben 0,4 s Unverwundbarkeit. Visuell als Kreis um das Spieler-Schiff dargestellt, der mit abnehmendem Schutzschild schwächer wird.
- **Waffenstufen 1–10**: Mehr Schüsse, höherer Schaden, seitliche/rückwärtige Richtungen ab Stufe 6.
- **Raketen-Munition**: Start mit 3, Nachschub durch Widgets (+2).
- Kontakt mit Gegner/Boss wirkt wie ein Treffer.
### Waffenstufen im Detail
| Stufe | Schüsse | Abklingzeit | Schaden |
|-------|---------|-------------|---------|
| 1 | 1 gerade | 280 ms | 1 |
| 2 | 2 gerade | 250 ms | 1 |
| 3 | 3 gerade | 240 ms | 1 |
| 4 | 3 gerade + 2 Diagonalen (±25°) | 200 ms | 1 |
| 5 | 4 gerade + 2 Diagonalen (±30°) | 180 ms | 2 |
| 6 | + seitliche Schüsse (±90°) | 170 ms | 2 |
| 7 | + Rückwärtsschuss (180°) | 160 ms | 3 |
| 8 | + 2 weitere Diagonalen (±60°) | 150 ms | 3 |
| 9 | + 2 äußere gerade Schüsse + ±60° | 140 ms | 4 |
| 10 | + 2 Rückwärts-Diagonalen (±135°) | 130 ms | 5 |
### Gegner-Typen
| Typ | Ab Level | HP | Punkte | Schussgeschw. | Raketen |
|-----|----------|----|--------|---------------|---------|
| enemyBug | 1 | 3 | 100 | 200 | – |
| enemySaucer | 3 | 5 | 250 | 240 | Alle 5 s |
| enemyFighter | 6 | 7 | 400 | 280 | Alle 3 s |
- Gegner-Leben steigen pro Level um 12 %, Feuerrate um bis zu 50 %.
- Gegner tauchen zur Formationshöhe und bewegen sich dann frei im Bildschirm (Begrenzung oben/unten).
- **Raketen** werden zielsuchend abgefeuert, Geschwindigkeit (+3/Level) und Drehrate (+0,08/Level) steigen pro Level.
- Treffer machen Gegner transparenter (HP-Anzeige).
### Bosse
- Basis-HP: 160, +30 pro Level.
- Bewegt sich seitlich, feuert 3 gerade Schüsse und **Boss-Raketen** (zielsuchend, abschießbar).
- Beim Tod: garantierte Schutzschild-Aufladung + Raketen-Widget.
- 2000 Punkte, HP-Balken oben im HUD.
### Raketen (Spieler)
- Zielsuchend, maximale Lebensdauer 3,5 s.
- Detonation mit Kettenreaktion: überlappende Raketen explodieren ebenfalls.
- Schaden: 3 an Gegnern/Boss, zerstört Gegner-Schüsse und Raketen.
- Start: 3 Raketen, Nachschub durch Widgets.
- Schüttel-Intensität bestimmt die Salvo-Größe (bis zu 3 Raketen pro Schütteln).
### Widgets
| Typ | Aussehen | Effekt | Drop-Chance |
|-----|----------|--------|-------------|
| Raketen-Widget | Grünes Diamant | +2 Raketen | 12 % (markierte Gegner) |
| Waffen-Widget | Oranges Dreieck | +1 Waffenstufe | 3 % |
| Schutzschild-Widget | Blaues Plus | Schutzschild auf 100 % | 4 % |
### Neutrale Schutzschilde
- Schweben quer durchs Bild, absorbieren Gegner-Schüsse.
- 3 HP, transparent bei Beschädigung.
- Explodieren bei Raketenkontakt.
- Spawnen alle 9 s.
## HUD
- Oben links: Punkte, Leben, Schutzschild (%).
- Oben Mitte: Level.
- Oben rechts: Raketen-Munition, Waffenstufe, Pause-Button.
- Boss-HP-Balken unter der Level-Anzeige.
## Technik
- **Phaser 4** (4.2.1) – Spiele-Framework
- **TypeScript** – Typsicherheit (strict mode)
- **Vite** – Build-Tool
- **Web Audio API** – 8-Bit-Chiptune-Musik und Soundeffekte (keine Audio-Dateien)
- **DeviceOrientation / DeviceMotion** – Gyroskop-Steuerung (iOS 13+ mit Permission)
- **i18n** – Deutsch und Englisch, Sprache aus Browser/Locale, in `localStorage` gespeichert
- **Prozedurale Texturen** – alle Sprites per Phaser-Graphics gezeichnet, keine Bild-Assets
- **PWA** – Manifest, Icons, Homescreen-Installation
- **localStorage** – Highscore/Einstellungen (Musik an/aus, Sprache)
- **GitHub Pages** – Build mit `npm run build:github` (base `/sky_jitter/`)
## Projektstruktur
```
index.html            Einstiegspunkt, Overlays (Start, Querformat-Hinweis)
vite.config.ts        Vite-Konfiguration (GitHub-Pages-Base)
playwright.config.ts  Playwright-Testkonfiguration
public/               PWA-Manifest, Icons, Favicon
src/main.ts           Phaser-Initialisierung, Sensor-Events
src/style.css         Globale Styles, Overlays
src/scenes/GameScene.ts Zentrale Spielszene
src/game/sprites.ts     Prozedurale Texturen (Schiff, Gegner, Waffen)
src/game/weapons.ts     Waffenstufen und Schuss-Spezifikationen
src/game/background.ts  Parallax-Sternfeld, Galaxien-Nebel
src/audio/audio.ts      Audio-Manager (SFX, Musik)
src/audio/music.ts      Songdaten (menu, level, boss)
src/i18n/               Sprachdateien (de.json, en.json), Übersetzer
tests/                  Playwright-Tests (smoke, skyjitter) + Screenshots
```
## Testing mit Screenshots
Für automatisierte Tests kann [Playwright](https://playwright.dev/) verwendet werden:
```bash
npx playwright install chromium
npm test
```
Ein Test startet das Spiel im Headless-Modus, macht Screenshots nach festgelegten Zeitintervallen und vergleicht sie mit Referenzbildern.
### Test-Szenarien
1. **Level-Start**: HUD zeigt korrekte Werte (Punkte, Leben, Level).
2. **Gegner-Spawn**: Formation erscheint oben, bewegt sich seitlich.
3. **Schuss-Abgabe**: Spieler-Schüsse fliegen in angegebener Richtung.
4. **Raketen-Feuer**: Spieler-Rakete steuert zum nächsten Ziel.
5. **Boss-Spawn**: Boss erscheint, feuert Raketen.
6. **Widget-Drop**: Markierter Gegner lässt Widget fallen.
7. **Pause**: Spiel pausiert, Overlay erscheint.
8. **Game Over**: Bei 0 Leben, Endstand angezeigt.
## Lizenz
Eigenentwicklung, kein externer Code.
