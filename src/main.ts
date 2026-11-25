import './style.css'
import Phaser from 'phaser'
import { GameScene } from './scenes/GameScene'
import { t } from './i18n'
import { audio } from './audio/audio'
const BASE_WIDTH = 960
const BASE_HEIGHT = 540
function requireEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id)
  if (!el) throw new Error(`Missing element #${id}`)
  return el as T
}
const startOverlay = requireEl<HTMLDivElement>('start-overlay')
const startButton = requireEl<HTMLButtonElement>('start-button')
const rotateHint = requireEl<HTMLDivElement>('rotate-hint')
const versionText = requireEl<HTMLDivElement>('version-text')
startButton.textContent = t('start')
rotateHint.textContent = t('rotateHint')
versionText.textContent = `v${__APP_VERSION__}`
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-root',
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [GameScene],
})
// Debug hook for automated tests (dev server only)
if (import.meta.env.DEV) (window as unknown as { __game?: Phaser.Game }).__game = game
// Landscape enforcement: show a hint while the device is held upright
function updateOrientationHint(): void {
  const portrait = window.innerHeight > window.innerWidth
  rotateHint.classList.toggle('hidden', !portrait)
}
window.addEventListener('resize', updateOrientationHint)
updateOrientationHint()
// iOS 13+ exposes requestPermission() on the sensor event classes (not in the TS DOM typings)
type PermissionCapable = { requestPermission?: () => Promise<string> }
// Must be called synchronously inside the user gesture (button click)
async function requestSensors(): Promise<boolean> {
  try {
    const orientation = DeviceOrientationEvent as unknown as PermissionCapable
    if (orientation.requestPermission) {
      if ((await orientation.requestPermission()) !== 'granted') return false
    }
    const motion = DeviceMotionEvent as unknown as PermissionCapable
    if (motion.requestPermission) await motion.requestPermission()
    return true
  } catch (err) {
    console.warn('Sensor permission failed:', err)
    return false
  }
}
// Cubic non-linearity for gyro control: low inputs are more precise,
// full range still reaches ±1.0. Maps [-1, 1] → [-1, 1] preserving sign.
function cubicMap(v: number): number {
  const sign = v < 0 ? -1 : 1
  const abs = Math.abs(v)
  return sign * (abs * abs * abs)
}
// In landscape, gamma is the left/right tilt; when rotated the axis moves to beta
// Inverted gamma for intuitive left/right control, beta for forward/backward
window.addEventListener('deviceorientation', (e: DeviceOrientationEvent) => {
  const angle = window.screen.orientation?.angle ?? 0
  // Invert gamma for intuitive left/right control
  const gamma = angle === 90 || angle === -270 ? (e.beta ?? 0) : -(e.gamma ?? 0)
  // Beta controls forward/backward movement
  const beta = angle === 90 || angle === -270 ? (e.gamma ?? 0) : (e.beta ?? 0)
  // Normalize to [-1, 1] range (gamma: ±90°, beta: ±180°) and apply cubic curve
  const normalizedTilt = cubicMap(Math.max(-1, Math.min(1, gamma / 90)))
  const normalizedPitch = cubicMap(Math.max(-1, Math.min(1, beta / 90)))
  game.events.emit('tilt', normalizedTilt, normalizedPitch)
})
// Shake detection: magnitude of acceleration minus gravity, throttled
let lastShakeEmit = 0
window.addEventListener('devicemotion', (e: DeviceMotionEvent) => {
  const a = e.accelerationIncludingGravity
  if (!a) return
  const magnitude = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0) - 9.81
  const now = performance.now()
  if (now - lastShakeEmit > 40) {
    lastShakeEmit = now
    game.events.emit('shake', magnitude)
  }
})
startButton.addEventListener('click', () => {
  audio.unlock() // audio must be unlocked inside the user gesture
  audio.setScene('level')
  void requestSensors().then(() => startOverlay.classList.add('hidden'))
})
