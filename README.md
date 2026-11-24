# Sky Jitter
Arcade-Shooter im Querformat, optimiert für Smartphones (iPhone 11 / iOS Safari).
Gegner ausweichen, abschießen, Spezialwaffen sammeln – im Stil klassischer Bats-artiger Shooter.
## Installation & Start
```bash
npm install
npm run dev          # Vite-Devserver (localhost:5173)
npm run build        # Produktions-Build
npm run preview      # Build lokal testen
npm run check:syntax # Typprüfung (tsc --noEmit)
```
Auf dem Gerät: Browser öffnen, „Zum Startbildschirm hinzufügen" für Vollbild-Modus.
## Steuerung
| Aktion | Mobil | Desktop |
|--------|-------|---------|
| Bewegen | Gerät neigen (Gyroskop) | Pfeiltasten ← → |
| Höhe | – | Pfeiltasten ↑ ↓ |
| Schießen | Tippen / Leertaste | Leertaste |
| Rakete | Schütteln (DeviceMotion) | X |
| Pause | P / Pause-Button | P |
| Neustart | – | R |
## Spielprinzip
- **50 Level** mit steigender Schwierigkeit.
- **Gegner** fliegen in Formationen von oben, weichen seitlich aus und feuern zurück.
- **Markierte Gegner** (12 % Chance) lassen **Raketen-Widgets** fallen.
- **Waffen-Upgrades** steigen automatisch mit dem Punktestand (alle 2500 Punkte) oder durch **Waffen-Widgets**.
- **Extraleben** alle 5000 Punkte.
- **Bosse** alle 10 Level mit eigenen Angriffsmustern.
- **Game Over** bei 0 Leben.
## Elemente
### Spieler-Schiff
- Start mit 5 Leben.
- **Schild** (0–100 %): Zieht Treffer zuerst ab. Bei 0 % wird ein Leben abgezogen, Respawn mit 1,5 s Unverwundbarkeit.
- **Waffenstufen 1–10**: Mehr Schüsse, höherer Schaden, seitliche/rückwärtige Richtungen ab Stufe 6.
### Gegner-Typen
| Typ | Ab Level | HP | Punkte | Schussgeschw. | Raketen |
|-----|----------|----|--------|---------------|---------|
| enemyBug | 1 | 3 | 100 | 200 | – |
| enemySaucer | 3 | 5 | 250 | 240 | Alle 5 s |
| enemyFighter | 6 | 7 | 400 | 280 | Alle 3 s |
- Gegner bewegen sich frei im Bildschirm (Begrenzung oben/unten).
- **Raketen** werden zielsuchend abgefeuert, Geschwindigkeit und Drehrate steigen pro Level.
- Treffer machen Gegner transparenter (HP-Anzeige).
### Bosse
- Basis-HP: 160, +30 pro Level.
- Bewegt sich seitlich, feuert gerade Schüsse und **Boss-Raketen** (zielsuchend, abschießbar).
- Beim Tod: garantierte Schild-Aufladung + Raketen-Widget.
- 2000 Punkte.
### Raketen (Spieler)
- Zielsuchend, maximale Lebensdauer 3,5 s.
- Detonation mit Kettenreaktion: überlappende Raketen explodieren ebenfalls.
- Schaden: 3 an Gegnern/Boss, zerstört Gegner-Schüsse und Raketen.
- Start: 3 Raketen, Nachschub durch Widgets.
### Widgets
| Typ | Aussehen | Effekt | Drop-Chance |
|-----|----------|--------|-------------|
| Raketen-Widget | Grünes Diamant | +2 Raketen | 12 % (markierte Gegner) |
| Waffen-Widget | Oranges Dreieck | +1 Waffenstufe | 3 % |
| Schild-Widget | Blaues Plus | Schild auf 100 % | 4 % |
### Schutzschilde (neutral)
- Schweben quer durchs Bild, absorbieren Gegner-Schüsse.
- 3 HP, transparent bei Beschädigung.
- Explodieren bei Raketenkontakt.
## Technik
- **Phaser 4** (4.2.1) – Spiele-Framework
- **TypeScript** – Typsicherheit
- **Vite** – Build-Tool
- **Web Audio API** – 8-Bit-Chiptune-Musik und Soundeffekte
- **DeviceOrientation / DeviceMotion** – Gyroskop-Steuerung (iOS 13+ mit Permission)
- **i18n** – Deutsch und Englisch, Sprache aus Browser/Locale
## Projektstruktur
```
index.html            Einstiegspunkt, Overlays
src/main.ts           Phaser-Initialisierung, Sensor-Events
src/scenes/GameScene.ts Zentrale Spielszene
src/game/sprites.ts     Prozedurale Texturen (Schiff, Gegner, Waffen)
src/game/weapons.ts     Waffenstufen und Schuss-Spezifikationen
src/game/background.ts  Parallax-Sternfeld, Galaxien-Nebel
src/audio/audio.ts      Audio-Manager (SFX, Musik)
src/audio/music.ts      Songdaten (menu, level, boss)
src/i18n/               Sprachdateien (de.json, en.json), Übersetzer
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
