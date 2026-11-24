# PROMPTS.md – Projektleitplanken & Prompt-Historie
Dieses Dokument ist die zentrale Leitplanke für die agentische Entwicklung.
Jeder Prompt wird hier protokolliert. Spätere Prompts beziehen sich auf dieses Dokument.
---
## 1. Projektübersicht
- **Spielname:** Sky Jitter
- **Genre:** Arcade-Shooter im Stil von *Bats* – Gegnern ausweichen, abschießen, Spezialwaffen sammeln
- **Plattform:** Web-Browser, optimiert für Smartphones, Zielgerät iPhone 11 (iOS Safari)
- **Ausrichtung:** Querformat (Landscape)
- **Ausführung:** rein clientseitig, keine Server-Logik
- **Installierbar:** als PWA (Homescreen, Vollbild)
## 2. Technik-Stack
- **Build-Tool:** Vite
- **Spiele-Framework:** Phaser 4 (installiert: 4.2.1)
- **Audio:** Chiptune-Hintergrundmusik (8-Bit, abschaltbar), passend zur Szene
- **Speicherung:** `localStorage` (Highscore, Einstellungen)
- **Sprache:** JavaScript (ES-Module)
### 2.1 Projektstruktur
```
index.html            Einstiegspunkt, Overlays (Start, Querformat-Hinweis)
src/main.js           Phaser-Initialisierung, Sensor-Freigabe, Tilt-Events
src/style.css         Globale Styles, Overlays
src/scenes/           Phaser-Szenen (GameScene, später Menü, Game Over ...)
src/i18n/             Sprachdateien (de.json, en.json) und Übersetzungs-Helfer
```
## 3. Konzept
### 3.1 Steuerung
- **Bewegung:** Gerätelage (`DeviceOrientationEvent`), Neigung links/rechts bewegt das Schiff.
- **Schießen:** Tippen/Drücken auf das Spielfeld.
- **Spezialschuss:** Schütteln (`DeviceMotionEvent`). Die Anzahl der abgefeuerten Raketen hängt von Intensität und Dauer des Schüttelns ab.
- **iOS:** Der Gyroskop-Zugriff muss per Button-Tap freigegeben werden (`DeviceOrientationEvent.requestPermission()`).
- **Desktop-Fallback:** Pfeiltasten (links/rechts) und Leertaste.
### 3.2 Spielprinzip
- **Gegner:** Angreifer fliegen in Formationen von oben und feuern zurück. Gegner können ausweichen oder abgeschossen werden.
- **Markierte Gegner:** Bestimmte Gegner sind markiert. Beim Abschuss lassen sie leuchtende **Raketen-Widgets** fallen, die der Spieler einsammeln muss.
- **Punkte:** Jeder Gegnertyp bringt unterschiedlich viele Punkte.
- **Extraleben:** Bei festen Punktegrenzen (Vorschlag: 5.000 / 15.000 / 30.000 …).
- **Leben:** Start mit **5 Leben**. Keine Leben mehr = Game Over. Leben sind endlich.
### 3.3 Level
- **Anzahl:** 50 Level.
- **Fortschritt:** Schwierigkeit und Dauer steigen mit jedem Level.
- **Bosse:** Starke Zwischengegner in festen Abständen (Vorschlag: alle 10 Level), mit eigenen Angriffsmustern.
### 3.4 Waffen & Upgrades
- **Upgrade-Wege (beides):**
  - Automatisch durch Punkteschwellen
  - Durch Power-Ups, die Gegner fallen lassen
- **Upgrade-Beispiele:** Schussrate, Schaden, Doppelschuss, Schussbreite.
### 3.5 Darstellung (umschaltbar)
- **8-Bit:** Pixel-Art-Stil.
- **Vector:** Geometrische Formen mit Neon-Effekten.
- **Level-Random:** Stil wird pro Level zufällig gewählt.
- Die Umschaltung erfolgt über das Einstellungsmenü.
### 3.6 Sprache (i18n)
- Mehrsprachig, umschaltbar.
- **Standard:** Browsersprache.
- **Struktur:** Eine Sprachdatei pro Sprache (`src/i18n/de.json`, `src/i18n/en.json`). Neue Sprachen werden nur durch Hinzufügen einer Datei und Registrierung in `src/i18n/index.js` ergänzt.
- Keine Texte hartcodiert im Spielcode.
### 3.7 Audio
- 8-Bit-Hintergrundmusik, abschaltbar (Einstellung wird in `localStorage` gespeichert).
- Musikstil passt zur aktuellen Szene (Menü, Level, Boss, Game Over).
## 4. Entwicklungsregeln (für alle Prompts)
1. Vor jeder Änderung diese Datei lesen und die Regeln einhalten.
2. Neue Entscheidungen werden hier ergänzt, nicht nur im Chat getroffen.
3. Jeder Prompt wird in Abschnitt 6 protokolliert (Datum, Prompt-Kurzfassung, Ergebnis).
4. Texte nur über die Sprachdateien ausgeben.
5. Code ist auf iPhone 11 (iOS Safari) zu testen: Touch, Gyroskop, Vollbild, Performance (60 FPS-Ziel).
6. Keine Server-Abhängigkeiten. Alles läuft im Client.
## 5. Offene Punkte
- Feinabstimmung Balancing (Punkte, Gegnerzahl, Boss-HP)
- Sounds und 8-Bit-Musik (noch nicht umgesetzt)
- Upgrades für Waffen (noch nicht umgesetzt)
- Darstellungsstile 8-Bit / Vector (noch nicht umgesetzt)
- Anzahl und Typen der Gegner und Bosse
- Genaue Upgrade-Stufen
- Gestaltung der Power-Ups und Raketen-Widgets
- Umfang der Musikstücke (ein Stück pro Szene oder pro Level)
- PWA-Manifest und Icons
## 6. Prompt-Historie
| # | Datum | Prompt (Kurzfassung) | Ergebnis |
|---|-------|----------------------|----------|
| 1 | 2026-11-24 | Brainstorming: Bats-artiges Smartphone-Spiel mit Gyroskop-Steuerung, Vite, Konzept erarbeiten | Konzept festgehalten |
| 2 | 2026-11-24 | Spielname-Vorschläge angefragt, Auswahl: Option 7 | Spielname „Sky Jitter“ übernommen |
| 3 | 2026-11-24 | Vite-Projekt mit Phaser aufsetzen | Phaser 4.2.1 installiert, Template entfernt, Grundgerüst (Tilt-Steuerung, Schuss, HUD, i18n de/en, Querformat-Hinweis) angelegt |
| 4 | 2026-11-24 | Gegner, Schuss, Schütteln-Raketen, Level (50), Bosse, Extraleben, Game Over umsetzen | Formation mit 3 Gegnertypen, markierte Gegner lassen Raketen-Widgets fallen, Schütteln feuert Raketen (Impuls-Schwelle, 150 ms Takt), Boss alle 10 Level, Extraleben alle 5.000 Punkte, 5 Leben mit 1 s Unverwundbarkeit. Noch nicht auf Gerät getestet |
| 5 | 2026-11-24 | npm-Script für Syntaxprüfung (`check:syntax`), GameScene neu schreiben: Treffer kosten Leben mit Respawn, Gegner verlieren HP und werden transparent, gerade Schüsse, zielsuchende Raketen mit Explosion, Schutzschilde als neutrale Hindernisse | `check:syntax` = `tsc --noEmit` angelegt; `GameScene.ts` neu geschrieben (Kollisionen per Kreisabstand statt Physics-Callbacks, Gegner-Schüsse mit Geschwindigkeit beim Erzeugen). Typprüfung fehlerfrei |
| 6 | 2026-11-24 | Höheres Waffenlevel, seitliches/rückwärtiges Schießen (Spieler kann weiter nach vorne, Gegner sinken weiter in den unteren Bereich), Kontakt mit Gegner wie Treffer, zielsuchende Raketen für Gegner | Waffenstufen auf 10 erhöht (Stufen 8–10: seitliche Diagonalen, Rückwärtsschüsse, höherer Schaden). Spieler-Mindesthöhe 260 → 170. Gegner sinken nach der Formation weiter nach unten und verschwinden am unteren Rand. Kontakt mit Gegner/Boss wirkt wie Treffer. Saucer (ab Level 3) und Fighter (ab Level 6) feuern zielsuchende Raketen, abschießbar. `check:syntax` fehlerfrei |
| 7 | 2026-11-24 | Feinde stärker in höheren Levels (schnellere/häufigere Raketen), Bosse härter, weniger Widgets | Raketen-Geschwindigkeit +3 pro Level, Drehrate +0,08 pro Level. Saucer alle 5 s, Fighter alle 3 s. Boss-Basis-HP 160 (+30/Level). Drop-Chancen: Markiert 12 %, Waffe 3 %, Schild 4 %. Nebel-Textur zu Galaxien/Nebel umgestaltet. `check:syntax` fehlerfrei |
| 8 | 2026-11-24 | README.md erstellen, Playwright als Testing-Framework einbinden | README mit Anleitung, Spielprinzip, Elementen (Gegner, Bosse, Raketen, Widgets), Technik, Projektstruktur. Playwright installiert, playwright.config.ts und tests/skyjitter.test.ts angelegt, package.json um "test"-Skript ergänzt |
