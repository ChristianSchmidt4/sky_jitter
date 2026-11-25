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
- **Speicherung:** `localStorage` (Highscore, Einstellungen, Sprache)
- **Sprache:** TypeScript (ES-Module, strict mode)
- **Testing:** Playwright (Screenshot- und Smoke-Tests)
- **Deployment:** GitHub Pages (Build mit `npm run build:github`, base `/sky_jitter/`)
### 2.1 Projektstruktur
```
index.html            Einstiegspunkt, Overlays (Start, Querformat-Hinweis)
vite.config.ts        Vite-Konfiguration (GitHub-Pages-Base)
playwright.config.ts  Playwright-Testkonfiguration
public/               PWA-Manifest, Icons, Favicon
src/main.ts           Phaser-Initialisierung, Sensor-Freigabe, Tilt-Events
src/style.css         Globale Styles, Overlays
src/scenes/GameScene.ts Zentrale Spielszene (Ablauf, Eingaben, Kollisionen, HUD)
src/game/sprites.ts     Prozedurale Texturen (Schiff, Gegner, Waffen, Widgets)
src/game/weapons.ts     Waffenstufen 1–10 und Schuss-Spezifikationen
src/game/background.ts  Parallax-Sternfeld, Galaxien-Nebel
src/audio/audio.ts      Audio-Manager (SFX, Musik, Web Audio API)
src/audio/music.ts      Songdaten (menu, level, boss)
src/i18n/               Sprachdateien (de.json, en.json) und Übersetzungs-Helfer
tests/                  Playwright-Tests (smoke.test.ts, skyjitter.test.ts) + Screenshots
```
## 3. Konzept
### 3.1 Steuerung
- **Bewegung:** Gerätelage (`DeviceOrientationEvent`), Neigung links/rechts bewegt das Schiff, Neigung vor/zurück die Höhe.
- **Schießen:** Tippen/Gedrückt-Halten auf das Spielfeld (Feuer nur, solange der Finger unten ist).
- **Dauerfeuer:** Tippen auf den Dauerfeuer-Button im HUD bzw. Taste F schaltet kontinuierliches Schießen an/aus.
- **Spezialschuss:** Schütteln (`DeviceMotionEvent`). Die Anzahl der abgefeuerten Raketen hängt von Intensität und Dauer des Schüttelns ab (bis zu 3 Raketen pro Schütteln).
- **iOS:** Der Gyroskop-Zugriff muss per Button-Tap freigegeben werden (`DeviceOrientationEvent.requestPermission()`).
- **Desktop-Fallback:** Pfeiltasten (links/rechts, hoch/runter), Leertaste (Schießen), F (Dauerfeuer), X (Raketen).
- **Pause:** P-Taste oder Tippen auf den Pause-Button im HUD.
- **Neustart:** R-Taste oder Tippen auf das Overlay.
### 3.2 Spielprinzip
- **Gegner:** Angreifer fliegen in Formationen von oben und feuern zurück. Gegner können ausweichen oder abgeschossen werden.
- **Markierte Gegner:** Bestimmte Gegner sind markiert. Beim Abschuss lassen sie leuchtende **Raketen-Widgets** fallen, die der Spieler einsammeln muss.
- **Punkte:** Jeder Gegnertyp bringt unterschiedlich viele Punkte.
- **Extraleben:** Bei festen Punktegrenzen (alle 5.000 Punkte).
- **Leben:** Start mit **5 Leben**. Keine Leben mehr = Game Over. Leben sind endlich.
- **Schild:** Vorstufe zum Leben (0–100 %). Treffer ziehen zuerst vom Schild ab, erst ohne Schild kostet ein Treffer ein Leben.
- **Sieg:** Nach allen 50 Leveln.
### 3.3 Level
- **Anzahl:** 50 Level.
- **Fortschritt:** Schwierigkeit und Dauer steigen mit jedem Level.
- **Bosse:** Starke Zwischengegner alle 5 Level (5, 10, … 50), mit escalating Angriffsmustern: gerade Schuss-Salven, diagonale Schüsse (ab Boss 3), seitliche Schüsse (ab Boss 5), alle Richtungen (ab Boss 9). Zielsuchende Boss-Raketen (alle 3,5 s) und Helfer-Gegner (alle 6 s, max. 8 gleichzeitig). Boss-HP 300 + 80 pro Level, Farbe wird mit jedem Boss aggressiver (Lila → Magenta → Rot → Blau → Cyan → Gold → Blutrot). Beim Tod werden alle Gegner und Gegner-Raketen entfernt.
- **Gegner-Raketen:** Ab Level 1, 4, 8, 13 und 18 jeweils zähere Stufen (HP 1/2/3/4/6) mit eigener Farbe. Schutzschilde absorbieren sie.
- **Intermission:** Kurze Pause (1,6 s) zwischen den Leveln.
### 3.4 Waffen & Upgrades
- **Upgrade-Wege (beides):**
  - Automatisch durch Punkteschwellen (alle 2.500 Punkte)
  - Durch Power-Ups, die Gegner fallen lassen
- **Stufen:** 10 Waffenstufen mit mehr Schüssen, höherem Schaden und seitlichen/rückwärtigen Richtungen ab Stufe 6.
### 3.5 Darstellung
- **Prozedurale Vektor-Texturen:** Alle Sprites werden per Phaser-Graphics gezeichnet, keine Bild-Assets.
- **Hintergrund:** Parallax-Sternfeld (3 Ebenen) plus Galaxien-Nebel.
### 3.6 Sprache (i18n)
- Mehrsprachig, umschaltbar.
- **Standard:** Browsersprache.
- **Struktur:** Eine Sprachdatei pro Sprache (`src/i18n/de.json`, `src/i18n/en.json`). Neue Sprachen werden nur durch Hinzufügen einer Datei und Registrierung in `src/i18n/index.ts` ergänzt.
- Keine Texte hartcodiert im Spielcode.
- Auswahl wird in `localStorage` gespeichert.
### 3.7 Audio
- 8-Bit-Hintergrundmusik, abschaltbar (Einstellung wird in `localStorage` gespeichert).
- Musikstil passt zur aktuellen Szene (Menü, Level, Boss).
- Soundeffekte: Schuss, Explosion, Pickup, Treffer.
## 4. Entwicklungsregeln (für alle Prompts)
1. Vor jeder Änderung diese Datei lesen und die Regeln einhalten.
2. Neue Entscheidungen werden hier ergänzt, nicht nur im Chat getroffen.
3. Jeder Prompt wird in Abschnitt 6 protokolliert (Datum, Prompt-Kurzfassung, Ergebnis).
4. Texte nur über die Sprachdateien ausgeben.
5. Code ist auf iPhone 11 (iOS Safari) zu testen: Touch, Gyroskop, Vollbild, Performance (60 FPS-Ziel).
6. Keine Server-Abhängigkeiten. Alles läuft im Client.
## 5. Offene Punkte
- Feinabstimmung Balancing (Punkte, Gegnerzahl, Boss-HP, Gegner-HP-Wachstum)
- Einstellungsmenü (Musik-Umschaltung, Darstellungsstile) – Musik-Toggle im Code vorhanden, UI noch offen
- Darstellungsstile 8-Bit / Vector (noch nicht umgesetzt)
- Umfang der Musikstücke (ein Stück pro Szene oder pro Level)
- Test auf echtem Gerät (iPhone 11)
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
| 9 | 2026-11-24 | Schild-Mechanik verfeinern: Schild als Vorstufe zum Leben, Schild-Treffer geben kurze Unverwundbarkeit, Schild-Widget lädt Schild auf | Schild (0–100 %) zieht Treffer zuerst ab (35 Schaden), Schild-Treffer geben 0,4 s Unverwundbarkeit, bei 0 % kostet ein Treffer ein Leben mit 1,5 s Respawn-Unverwundbarkeit. Schild-Widget (4 %) lädt Schild auf 100 %. `check:syntax` fehlerfrei |
| 10 | 2026-11-24 | Waffenstufen-Details dokumentieren, HUD erweitern (Raketen-Munition, Waffenstufe, Pause-Button, Boss-HP-Balken) | Waffenstufen 1–10 mit Schüssen, Abklingzeit und Schaden dokumentiert. HUD zeigt Punkte, Leben, Schild, Level, Raketen, Waffe, Pause-Button und Boss-HP-Balken. `check:syntax` fehlerfrei |
| 11 | 2026-11-24 | README.md und PROMPTS.md mit allen fehlenden Infos aus dem Code aktualisieren | README um Skripte, Waffenstufen-Tabelle, HUD, Technik-Details, Projektstruktur ergänzt. PROMPTS.md um aktuelle Struktur, implementierte Features und Prompt-Historie erweitert |
| 12 | 2026-11-25 | Schutzschild-Visualisierung: Kreis um Spieler-Schiff, der mit abnehmendem Schutzschild schwächer wird; Begriff "Schild" → "Schutzschild" | GameScene.ts: shieldCircle + shieldStroke Graphics hinzugefügt, i18n aktualisiert, README/PROMPTS aktualisiert |
| 13 | 2026-11-25 | README.md und PROMPTS.md an den aktuellen Code angleichen | Docs korrigiert: Bosse alle 5 Level, Boss-HP 300 (+60/Level), Gegner-HP +25 %/Level, Dauerfeuer (F / Button), Boss-Helfer und Boss-Raketen, Gegner-Raketen-Stufen, Schutzschilde absorbieren Gegner-Raketen, Test-Beschreibung an reale Tests angepasst |
| 14 | 2026-11-25 | Stärkere Gegner und Bosse: diagonale/schräge/s Seitliche Bossschüsse, Boss-Farbverlauf (10 Stufen), Gegner-Tönung nach Level | Gegner-HP-Wachstum +35 %, Feuerrate +55 %, Boss-HP +80/Level, Boss-Farben (Lila→Magenta→Rot→Blau→Cyan→Gold→Blutrot), Boss-Schussmuster escalates ab Boss 3/5/9, Gegner-Farbverlauf ab Level 5, Boss-Größe +4 % pro Generation |
