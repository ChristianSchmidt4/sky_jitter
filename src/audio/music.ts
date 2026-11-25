// Chiptune song data. Each scene has several themed sections (A, B, C, Bridge)
// that are arranged into a longer song, so the loop does not repeat identically.
// Each section has 16 steps (eighth notes). Notes like "C4", "F#5", "Bb3"; "-" = rest.
export type Wave = OscillatorType
export interface Section {
  lead: number[]
  bass: number[]
}
export interface Song {
  bpm: number
  leadWave: Wave
  bassWave: Wave
  sections: Record<string, Section>
  // Arrangement: section names in playback order; the list loops afterwards
  arrangement: string[]
}
const NOTE_BASE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
function toMidi(tok: string): number {
  if (tok === '-') return 0
  const m = /^([A-G])(#|b)?(\d)$/.exec(tok)
  if (!m) throw new Error(`bad note: ${tok}`)
  const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0
  return (Number(m[3]) + 1) * 12 + NOTE_BASE[m[1]] + acc
}
// Builds a section from two strings of 16 whitespace-separated steps
function sec(lead: string, bass: string): Section {
  const leadSteps = lead.trim().split(/\s+/).map(toMidi)
  const bassSteps = bass.trim().split(/\s+/).map(toMidi)
  if (leadSteps.length !== 16 || bassSteps.length !== 16) {
    throw new Error(`section must have 16 steps: lead=${leadSteps.length} bass=${bassSteps.length}`)
  }
  return { lead: leadSteps, bass: bassSteps }
}
// Level song: bright, driving melody
export const LEVEL_SONG: Song = {
  bpm: 136,
  leadWave: 'square',
  bassWave: 'triangle',
  sections: {
    A: sec(
      'E5 - A5 G5 E5 - D5 C5 A4 - C5 - E5 - G5 -',
      'A2 - A2 - E2 - E2 - A2 - A2 - G2 - G2 -',
    ),
    B: sec(
      'C6 - B5 A5 G5 - E5 - D5 - E5 - G5 - A5 -',
      'F2 - F2 - C3 - C3 - G2 - G2 - E2 - E2 -',
    ),
    C: sec(
      'A5 - - E5 - C5 D5 E5 G5 - - D5 - B4 C5 D5',
      'A2 A2 E2 E2 F2 F2 G2 G2 A2 A2 E2 E2 D2 D2 E2 E2',
    ),
    Bridge: sec(
      'F5 - E5 - D5 - C5 - B4 - - - C5 - - -',
      'D2 - D2 - C2 - C2 - G2 - - - C2 - - -',
    ),
  },
  arrangement: ['A', 'A', 'B', 'A', 'C', 'A', 'B', 'Bridge', 'C', 'B', 'A', 'A'],
}
// Boss song: faster and tense, call-and-response between lead and bass
export const BOSS_SONG: Song = {
  bpm: 164,
  leadWave: 'sawtooth',
  bassWave: 'square',
  sections: {
    A: sec(
      'D5 - F5 - A5 - D6 - C6 - A5 - F5 - E5 -',
      'D2 D2 D3 D2 A2 A2 A3 A2 F2 F2 F3 F2 E2 E2 E3 E2',
    ),
    B: sec(
      'Bb4 - C5 - D5 - F5 - E5 - D5 - C5 - Bb4 -',
      'Bb2 - Bb2 - F2 - F2 - C3 - C3 - G2 - G2 -',
    ),
    C: sec(
      'A5 A5 G5 F5 E5 F5 G5 A5 D6 - C6 - A5 - F5 -',
      'D2 - D3 - C2 - C3 - A2 - A3 - F2 - F3 -',
    ),
    Bridge: sec(
      'F5 E5 D5 - C5 D5 E5 - F5 - - - A4 - - -',
      'D2 - - - C2 - - - F2 - - - D2 - - -',
    ),
  },
  arrangement: ['A', 'B', 'A', 'C', 'A', 'Bridge', 'C', 'B', 'A', 'C'],
}
// End boss song: extrem gruselig, dissonant – verminderte Tonleiter + Sekunden, Drohn-Bass, schreiende Melodie
export const END_BOSS_SONG: Song = {
  bpm: 72, // noch langsamer = bedrohlicher
  leadWave: 'sawtooth',
  bassWave: 'square',
  sections: {
    A: sec(
      'A4 - Bb4 - C5 - Bb4 - A4 - G#4 - A4 - Bb4 -',
      'A1 - A1 - A1 - A1 - A1 - A1 - A1 - A1 -',
    ),
    B: sec(
      'Eb5 - D5 - Db5 - C5 - Bb4 - B4 - C5 - Db5 -',
      'Eb1 - Eb1 - Eb1 - Eb1 - Bb1 - Bb1 - Bb1 - Bb1 -',
    ),
    C: sec(
      'F5 - F#5 - G5 - F#5 - F5 - E5 - Eb5 - D5 -',
      'D1 - D1 - A1 - A1 - D1 - D1 - A1 - A1 -',
    ),
    Bridge: sec(
      'Bb4 - Db5 - F5 - Bb5 - Eb5 - Gb5 - Bb4 - - -',
      'Bb1 - Bb1 - F1 - F1 - Bb1 - Bb1 - Eb1 - Eb1 -',
    ),
  },
  arrangement: ['A', 'A', 'B', 'A', 'Bridge', 'C', 'B', 'A', 'Bridge', 'C', 'A', 'B'],
}
// Menu song: calmer, melodic theme
export const MENU_SONG: Song = {
  bpm: 92,
  leadWave: 'triangle',
  bassWave: 'triangle',
  sections: {
    A: sec(
      'C5 - E5 - G5 - E5 - A4 - C5 - E5 - D5 -',
      'C2 - - - G2 - - - A2 - - - F2 - - -',
    ),
    B: sec(
      'F5 - E5 - D5 - C5 - B4 - - - G4 - - -',
      'F2 - - - C3 - - - G2 - - - G2 - - -',
    ),
    C: sec(
      'G5 - - E5 C5 - D5 - E5 - - - G5 - - -',
      'C3 - - - A2 - - - C3 - - - G2 - - -',
    ),
  },
  arrangement: ['A', 'B', 'A', 'C', 'B', 'A'],
}
