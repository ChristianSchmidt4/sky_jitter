// Subtle space background: slow parallax starfield plus faint nebula glow.
// Drawn with Phaser graphics, no image assets.
import Phaser from 'phaser'
interface Star {
  x: number
  y: number
  speed: number
  size: number
  alpha: number
}
const LAYERS = [
  { count: 60, minSpeed: 8, maxSpeed: 14, minSize: 0.6, maxSize: 1.0, alpha: 0.35 },
  { count: 35, minSpeed: 18, maxSpeed: 28, minSize: 0.9, maxSize: 1.4, alpha: 0.55 },
  { count: 15, minSpeed: 36, maxSpeed: 50, minSize: 1.4, maxSize: 2.0, alpha: 0.8 },
]
export class Background {
  private stars: Star[] = []
  private gfx: Phaser.GameObjects.Graphics
  private nebula: Phaser.GameObjects.Image[] = []
  constructor(private scene: Phaser.Scene, private W: number, private H: number) {
    this.makeNebula()
    for (const layer of LAYERS) {
      for (let i = 0; i < layer.count; i++) {
        this.stars.push({
          x: Phaser.Math.Between(0, W),
          y: Phaser.Math.Between(0, H),
          speed: Phaser.Math.Between(layer.minSpeed, layer.maxSpeed),
          size: Phaser.Math.FloatBetween(layer.minSize, layer.maxSize),
          alpha: layer.alpha,
        })
      }
    }
    this.gfx = scene.add.graphics().setDepth(-10)
  }
  // Intergalactic nebulae: multi-layered colour clouds with spiral arms
  private makeNebula(): void {
    if (!this.scene.textures.exists('nebula')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 }, false)
      // Soft outer glow
      for (let r = 120; r > 0; r -= 4) {
        const a = 0.02 + 0.03 * (1 - r / 120)
        g.fillStyle(0xffffff, a)
        g.fillCircle(120, 120, r)
      }
      // Spiral arms
      for (let i = 0; i < 120; i++) {
        const angle = i * 0.3
        const dist = 20 + i * 0.8
        const x = 120 + Math.cos(angle) * dist
        const y = 120 + Math.sin(angle) * dist
        const r = 8 + Math.random() * 12
        const hue = [0x4a2a8a, 0x1a5a8a, 0x8a2a5a, 0x2a7a6a][i % 4]
        g.fillStyle(hue, 0.06 + Math.random() * 0.04)
        g.fillCircle(x, y, r)
      }
      // Bright core
      for (let r = 40; r > 0; r -= 2) {
        const a = 0.08 * (1 - r / 40)
        g.fillStyle(0xaaddff, a)
        g.fillCircle(120, 120, r)
      }
      g.generateTexture('nebula', 240, 240)
      g.destroy()
    }
    // Galaxy dust clouds: larger, more transparent, varied tints
    const tints = [0x3a1a6a, 0x0f3d5c, 0x5a1a4a, 0x1a4a5a, 0x4a2a6a]
    tints.forEach((tint, i) => {
      const img = this.scene.add
        .image(Phaser.Math.Between(0, this.W), Phaser.Math.Between(0, this.H), 'nebula')
        .setTint(tint)
        .setAlpha(0.2 + i * 0.03)
        .setScale(2.8 + i * 0.5)
        .setDepth(-11)
      this.nebula.push(img)
    })
  }
  update(dt: number): void {
    this.gfx.clear()
    for (const s of this.stars) {
      s.y += s.speed * dt
      if (s.y > this.H) {
        s.y = -2
        s.x = Phaser.Math.Between(0, this.W)
      }
      this.gfx.fillStyle(0xffffff, s.alpha)
      this.gfx.fillCircle(s.x, s.y, s.size)
    }
    for (const n of this.nebula) {
      n.y += 4 * dt
      if (n.y > this.H + 160) n.y = -160
    }
  }
}
