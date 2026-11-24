// 8-bit chiptune music and sound effects using the Web Audio API (no audio assets needed).
import { LEVEL_SONG, BOSS_SONG, MENU_SONG, type Song, type Section } from './music'
export type MusicScene = 'menu' | 'level' | 'boss'
const MUSIC_KEY = 'skyjitter.music'
const MUSIC_VOLUME = 0.12
const SFX_VOLUME = 0.4
const SCHEDULE_AHEAD_S = 0.12
const TICK_MS = 25
const SONGS: Record<MusicScene, Song> = {
  menu: MENU_SONG,
  level: LEVEL_SONG,
  boss: BOSS_SONG,
}
// MIDI note number to frequency in Hz
const hz = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12)
class ChiptuneAudio {
  private ctx: AudioContext | null = null
  private musicBus: GainNode | null = null
  private sfxBus: GainNode | null = null
  private timer: number | null = null
  private scene: MusicScene = 'menu'
  private song: Song = MENU_SONG
  private arrPos = 0 // position in the arrangement
  private step = 0 // step within the current section (0..15)
  private nextTime = 0
  private enabled: boolean = localStorage.getItem(MUSIC_KEY) !== 'off'
  get isEnabled(): boolean {
    return this.enabled
  }
  // Must be called from a user gesture (required by iOS Safari).
  unlock(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctor()
      this.musicBus = this.ctx.createGain()
      this.musicBus.gain.value = this.enabled ? MUSIC_VOLUME : 0
      this.musicBus.connect(this.ctx.destination)
      this.sfxBus = this.ctx.createGain()
      this.sfxBus.gain.value = SFX_VOLUME
      this.sfxBus.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    if (this.timer === null) {
      this.nextTime = this.ctx.currentTime + 0.05
      this.timer = window.setInterval(() => this.schedule(), TICK_MS)
    }
  }
  setScene(scene: MusicScene): void {
    if (scene === this.scene) return
    this.scene = scene
    this.song = SONGS[scene]
    this.arrPos = 0
    this.step = 0
  }
  toggle(): boolean {
    this.enabled = !this.enabled
    localStorage.setItem(MUSIC_KEY, this.enabled ? 'on' : 'off')
    if (this.ctx && this.musicBus) {
      this.musicBus.gain.setTargetAtTime(this.enabled ? MUSIC_VOLUME : 0, this.ctx.currentTime, 0.05)
    }
    return this.enabled
  }
  sfx(kind: 'shot' | 'explode' | 'pickup' | 'hit'): void {
    if (!this.ctx || !this.sfxBus) return
    const now = this.ctx.currentTime
    switch (kind) {
      case 'shot':
        this.tone(this.sfxBus, 880, 220, 0.08, 'square', 0.2, now)
        break
      case 'explode':
        this.tone(this.sfxBus, 320, 40, 0.3, 'sawtooth', 0.35, now)
        break
      case 'pickup':
        this.tone(this.sfxBus, 660, 1320, 0.15, 'triangle', 0.3, now)
        break
      case 'hit':
        this.tone(this.sfxBus, 180, 50, 0.35, 'sawtooth', 0.5, now)
        break
    }
  }
  private currentSection(): Section {
    const name = this.song.arrangement[this.arrPos % this.song.arrangement.length]
    return this.song.sections[name]
  }
  private schedule(): void {
    const ctx = this.ctx
    const bus = this.musicBus
    if (!ctx || !bus) return
    // Avoid a burst of catch-up notes after the tab was in the background
    if (this.nextTime < ctx.currentTime) this.nextTime = ctx.currentTime + 0.05
    const stepDur = 60 / this.song.bpm / 2
    while (this.nextTime < ctx.currentTime + SCHEDULE_AHEAD_S) {
      const section = this.currentSection()
      const lead = section.lead[this.step]
      const bass = section.bass[this.step]
      if (bass) this.tone(bus, hz(bass), hz(bass), stepDur * 0.9, this.song.bassWave, 0.5, this.nextTime)
      if (lead) this.tone(bus, hz(lead), hz(lead), stepDur * 0.8, this.song.leadWave, 0.25, this.nextTime)
      this.nextTime += stepDur
      this.step++
      if (this.step >= 16) {
        this.step = 0
        this.arrPos++
      }
    }
  }
  private tone(
    bus: AudioNode,
    f0: number,
    f1: number,
    dur: number,
    wave: OscillatorType,
    vol: number,
    start: number,
  ): void {
    const ctx = this.ctx
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = wave
    osc.frequency.setValueAtTime(f0, start)
    if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(f1, start + dur)
    gain.gain.setValueAtTime(vol, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur)
    osc.connect(gain).connect(bus)
    osc.start(start)
    osc.stop(start + dur + 0.02)
  }
}
export const audio = new ChiptuneAudio()
