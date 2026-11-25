# PROMPTS.md – Prompt-Historie

Dieses Dokument ist die zentrale **Prompt-Historie** für die agentische Entwicklung.
Jeder Prompt wird hier protokolliert. Spätere Prompts beziehen sich auf dieses Dokument.

## Wichtige Regeln

Alle **Verhaltensregeln** für Agenten liegen in **`AGENTS.md`**. Diese Datei bitte vor jeder Änderung lesen.
Diese Datei (`PROMPTS.md`) dient ausschließlich der **historischen Dokumentation** der Entwicklungsschritte.

---

## Prompt-Historie

| # | Datum | Prompt (Kurzfassung) | Ergebnis |
|---|-------|----------------------|----------|
| 1 | 2026-11-24 | Brainstorming: Bats-artiges Smartphone-Spiel mit Gyroskop-Steuerung, Vite, Konzept erarbeiten | Konzept festgehalten |
| 2 | 2026-11-24 | Spielname-Vorschläge angefragt, Auswahl: Option 7 | Spielname „Sky Jitter" übernommen |
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
| 15 | 2026-11-25 | Zwei neue Gegnertypen: Zielgerichteter Laser-Gegner (ab Level 8) und Doppelläufiger Cannon (ab Level 14) | enemyLaser: schießt 3 zielgerichtet auf Spieler mit Streuung, Kadenz steigt mit Level. enemyDouble: 2 parallele Schüsse seitlich versetzt, höhere HP (9). Neue Sprites, Texturen, Feuerlogik in updateEnemies. |
| 16 | 2026-11-25 | Debug-Query-Parameter ?level=N für schnelles Testen | GameScene.ts: parseDebugLevel() liest URL-Parameter, setzt this.level und berechnet this.weaponLevel aus dem Level. README: Debug-Sektion mit Beispielen hinzugefügt. |
| 17 | 2026-11-25 | iOS PWA Audio: AudioContext beim Touch/Pointerdown entsperren, visibilitychange entfernt | audio.unlock() in onPointerDown, keine visibilitychange-Auflösung mehr. iOS kann nach Hintergrund-Aktivität wieder Audio abspielen. |
| 18 | 2026-11-25 | Gyro-Steuerung repariert: doppelte Normierung entfernt (22.5 im GameScene) | tiltWerte kommen bereits als [-1, 1] aus main.ts, / 22.5 war zu träge. Ship reagiert jetzt auf leichtes Drehen. |
| 19 | 2026-11-25 | Versionsanzeige im Start-Overlay, Minor-Version auto-increment via pre-commit hook | __APP_VERSION__ wird via Vite-define injiziert, version-text in Overlay, .git/hooks/pre-commit inkrementiert Minor-Nummer |
| 20 | 2026-11-25 | AGENTS.md erstellt – zentrale Agenten-Regeln aus PROMPTS.md extrahiert | AGENTS.md mit Versionierungsregel, Architektur-Overview, Enemy/Boss-Mechanics, iOS-Audio-Regeln. PROMPTS.md auf Prompt-Historie reduziert. |

---

## Offene Punkte

| Punkt | Status |
|-------|--------|
| Feinabstimmung Balancing | 🔲 |
| Einstellungsmenü (Musik, Darstellungsstile) | 🔲 |
| Test auf echtem Gerät (iPhone 11) | 🔲 |
