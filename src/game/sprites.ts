// Detailed vector sprites, drawn procedurally once and stored as textures.
// No external image assets are needed.
import Phaser from 'phaser'
type P = [number, number]
type Gfx = Phaser.GameObjects.Graphics
function poly(g: Gfx, pts: P[], fill: number, line: number, lw = 1.5): void {
  const points = pts.map(([x, y]) => new Phaser.Math.Vector2(x, y))
  g.fillStyle(fill, 1)
  g.fillPoints(points, true)
  g.lineStyle(lw, line, 1)
  g.strokePoints(points, true)
}
function bake(scene: Phaser.Scene, key: string, w: number, h: number, draw: (g: Gfx) => void): void {
  if (scene.textures.exists(key)) return
  const g = scene.make.graphics({ x: 0, y: 0 }, false)
  draw(g)
  g.generateTexture(key, w, h)
  g.destroy()
}
// Player ship: swept wings, armored hull, cockpit, twin engines
function drawPlayer(g: Gfx): void {
  g.fillStyle(0xff8800, 0.35).fillEllipse(22, 46, 14, 12).fillEllipse(42, 46, 14, 12)
  g.fillStyle(0xffe066, 1).fillEllipse(22, 48, 5, 8).fillEllipse(42, 48, 5, 8)
  poly(g, [[3, 38], [20, 22], [26, 32], [18, 44], [7, 44]], 0x1d5f8a, 0x0a2a40, 2)
  poly(g, [[61, 38], [44, 22], [38, 32], [46, 44], [57, 44]], 0x1d5f8a, 0x0a2a40, 2)
  g.lineStyle(2, 0xff3366, 1).lineBetween(8, 40, 19, 31).lineBetween(56, 40, 45, 31)
  poly(g, [[32, 1], [42, 16], [41, 40], [32, 46], [23, 40], [22, 16]], 0x3ad7ff, 0x0b3a5c, 2)
  g.lineStyle(1, 0x0b3a5c, 0.8).lineBetween(32, 8, 32, 40)
  g.fillStyle(0xffffff, 0.35).fillEllipse(28, 12, 4, 14)
  g.fillStyle(0x0a1a2a, 1).fillEllipse(32, 22, 11, 15)
  g.fillStyle(0x9ff6ff, 0.95).fillEllipse(32, 20, 7, 9)
  g.fillStyle(0x333a44, 1).fillRect(20, 40, 7, 6).fillRect(37, 40, 7, 6)
}
// Flying bug monster: antennae, legs, translucent wings, angry eyes and fangs
function drawBug(g: Gfx): void {
  const legs: [number, number, number, number][] = [[12, 26, 3, 30], [12, 30, 4, 38], [14, 34, 8, 42]]
  g.lineStyle(2, 0x1d5a22, 1)
  for (const [x1, y1, x2, y2] of legs) {
    g.lineBetween(x1, y1, x2, y2)
    g.lineBetween(48 - x1, y1, 48 - x2, y2)
  }
  g.lineStyle(2, 0x2a7a2a, 1).lineBetween(19, 9, 12, 1).lineBetween(29, 9, 36, 1)
  g.fillStyle(0x2a7a2a, 1).fillCircle(12, 1, 2.5).fillCircle(36, 1, 2.5)
  g.fillStyle(0xc8ffe6, 0.4).fillEllipse(9, 18, 16, 13).fillEllipse(39, 18, 16, 13)
  g.lineStyle(1, 0x7fe0a0, 0.8).strokeEllipse(9, 18, 16, 13).strokeEllipse(39, 18, 16, 13)
  g.fillStyle(0x58e05a, 1).fillCircle(24, 24, 15)
  g.lineStyle(2, 0x1d5a22, 1).strokeCircle(24, 24, 15)
  g.fillStyle(0xb8ff9a, 0.7).fillEllipse(24, 31, 16, 9)
  g.fillStyle(0xffffff, 1).fillCircle(18, 20, 5).fillCircle(30, 20, 5)
  g.fillStyle(0x111111, 1).fillCircle(19, 21, 2.5).fillCircle(31, 21, 2.5)
  g.lineStyle(2, 0x1d5a22, 1).lineBetween(13, 13, 21, 16).lineBetween(35, 13, 27, 16)
  g.fillStyle(0x111111, 1).fillEllipse(24, 35, 12, 5)
  g.fillStyle(0xffffff, 1).fillTriangle(19, 33, 21, 38, 23, 33).fillTriangle(25, 33, 27, 38, 29, 33)
}
// Alien saucer: glass dome, glowing rim lights, underside glow
function drawSaucer(g: Gfx): void {
  g.fillStyle(0x66ffcc, 0.25).fillEllipse(26, 30, 30, 14)
  g.fillStyle(0x9ff7ff, 0.85).fillEllipse(26, 14, 20, 17)
  g.lineStyle(1.5, 0x2a6a8a, 1).strokeEllipse(26, 14, 20, 17)
  g.fillStyle(0xffffff, 0.6).fillEllipse(21, 10, 6, 5)
  g.fillStyle(0x7a5ac8, 1).fillEllipse(26, 22, 48, 16)
  g.lineStyle(2, 0x3a2a6a, 1).strokeEllipse(26, 22, 48, 16)
  g.fillStyle(0x4a3590, 1).fillEllipse(26, 26, 40, 7)
  for (const x of [10, 17, 26, 35, 42]) g.fillStyle(0xffe066, 1).fillCircle(x, 23, 2)
}
// Armored alien fighter: spiked wings, glowing core eye
function drawFighter(g: Gfx): void {
  poly(g, [[26, 2], [38, 18], [50, 14], [44, 30], [51, 48], [34, 40], [26, 50], [18, 40], [1, 48], [8, 30], [2, 14], [14, 18]], 0xe0304a, 0x3a0a14, 2)
  poly(g, [[26, 12], [34, 24], [30, 40], [22, 40], [18, 24]], 0xff6a7a, 0x3a0a14, 1.5)
  g.lineStyle(1, 0x3a0a14, 1).lineBetween(26, 30, 26, 44)
  g.fillStyle(0xffffff, 1).fillCircle(26, 26, 5)
  g.fillStyle(0xff0000, 1).fillCircle(26, 26, 3)
  g.fillStyle(0x111111, 1).fillCircle(26, 26, 1.5)
  g.fillStyle(0xffcc00, 1).fillCircle(2, 14, 2).fillCircle(50, 14, 2)
}
// Laser enemy: diamond body, glowing red visor, target crosshair on underside
function drawLaser(g: Gfx): void {
  g.fillStyle(0xff2244, 1).fillEllipse(26, 26, 14, 14)
  poly(g, [[26, 0], [44, 26], [26, 52], [8, 26]], 0x880022, 0x3a0010, 2)
  g.lineStyle(1, 0x3a0010, 0.8).lineBetween(26, 6, 26, 46)
  g.lineStyle(1, 0x3a0010, 0.8).lineBetween(12, 26, 40, 26)
  g.fillStyle(0xff4488, 0.9).fillEllipse(26, 26, 12, 12)
  g.fillStyle(0xff0044, 1).fillEllipse(26, 26, 7, 7)
  g.fillStyle(0xffffff, 0.7).fillEllipse(22, 22, 4, 3)
  g.fillStyle(0xff6644, 0.3).fillCircle(26, 36, 8)
  g.fillStyle(0xff8866, 0.5).fillCircle(26, 38, 3)
}
// Double-barrel cannon: wide body, twin cannons, heavy armor plates
function drawDouble(g: Gfx): void {
  poly(g, [[8, 6], [44, 6], [50, 26], [44, 46], [8, 46], [2, 26]], 0x8a4400, 0x3a2000, 3)
  poly(g, [[12, 12], [40, 12], [44, 26], [40, 40], [12, 40], [8, 26]], 0xcc6622, 0x3a2000, 2)
  g.lineStyle(2, 0x3a2000, 1).lineBetween(12, 20, 40, 20).lineBetween(12, 32, 40, 32)
  g.fillStyle(0xffcc44, 1).fillCircle(26, 26, 5)
  g.fillStyle(0xffff88, 0.6).fillCircle(26, 26, 3)
  g.fillStyle(0xffaa22, 1).fillRect(6, 20, 6, 12).fillRect(40, 20, 6, 12)
  g.fillStyle(0xff8800, 1).fillCircle(9, 26, 2).fillCircle(43, 26, 2)
}
// Mothership boss: wings, armor plates, cockpit dome, turrets, glowing core
function drawBoss(g: Gfx): void {
  g.fillStyle(0xff3300, 0.18).fillEllipse(100, 58, 196, 100)
  poly(g, [[4, 58], [40, 38], [62, 78], [32, 98], [10, 90]], 0x5a1a3a, 0x1a0510, 3)
  poly(g, [[196, 58], [160, 38], [138, 78], [168, 98], [190, 90]], 0x5a1a3a, 0x1a0510, 3)
  g.fillStyle(0x7a2450, 1).fillEllipse(100, 58, 150, 66)
  g.lineStyle(3, 0x1a0510, 1).strokeEllipse(100, 58, 150, 66)
  g.lineStyle(2, 0x3a0a24, 1).lineBetween(40, 46, 160, 46).lineBetween(34, 68, 166, 68)
  g.fillStyle(0xff9955, 0.9).fillEllipse(100, 44, 52, 32)
  g.lineStyle(2, 0x3a0a24, 1).strokeEllipse(100, 44, 52, 32)
  g.fillStyle(0xffffff, 0.6).fillEllipse(90, 38, 14, 8)
  for (const x of [42, 72, 128, 158]) {
    g.fillStyle(0x333333, 1).fillCircle(x, 78, 6)
    g.fillStyle(0xff4444, 1).fillCircle(x, 78, 2.5)
  }
  g.fillStyle(0xffdd00, 1).fillCircle(100, 74, 9)
  g.fillStyle(0xffffff, 1).fillCircle(100, 74, 4)
}
function drawBullet(g: Gfx): void {
  g.fillStyle(0xffff66, 0.45).fillRoundedRect(0, 0, 8, 18, 4)
  g.fillStyle(0xffffff, 1).fillRoundedRect(2, 2, 4, 14, 2)
}
function drawMissile(g: Gfx): void {
  g.fillStyle(0xffaa33, 1).fillEllipse(6, 24, 6, 8)
  poly(g, [[6, 0], [11, 8], [11, 21], [6, 25], [1, 21], [1, 8]], 0x6fffb0, 0x0a4a2a, 1.5)
  g.fillStyle(0xffffff, 0.7).fillEllipse(6, 8, 3, 6)
}
function drawEnemyShot(g: Gfx): void {
  g.fillStyle(0xff5555, 0.5).fillEllipse(5, 8, 10, 16)
  g.fillStyle(0xffdddd, 1).fillEllipse(5, 8, 4, 10)
}
function drawPickupMissile(g: Gfx): void {
  poly(g, [[12, 0], [24, 12], [12, 24], [0, 12]], 0x00ff88, 0xffffff, 2)
  g.fillStyle(0xaaffdd, 1).fillEllipse(12, 12, 8, 8)
}
function drawPickupWeapon(g: Gfx): void {
  g.fillStyle(0xff9900, 0.4).fillCircle(12, 12, 12)
  g.fillStyle(0xff9900, 1).fillCircle(12, 12, 9)
  g.lineStyle(2, 0xffffff, 1).strokeCircle(12, 12, 9)
  g.fillStyle(0xffffff, 1).fillTriangle(12, 5, 17, 15, 7, 15)
}
export function createTextures(scene: Phaser.Scene): void {
  bake(scene, 'player', 64, 52, drawPlayer)
  bake(scene, 'enemyBug', 48, 44, drawBug)
  bake(scene, 'enemySaucer', 52, 40, drawSaucer)
  bake(scene, 'enemyFighter', 52, 52, drawFighter)
  bake(scene, 'enemyLaser', 52, 52, drawLaser)
  bake(scene, 'enemyDouble', 52, 52, drawDouble)
  bake(scene, 'boss', 200, 110, drawBoss)
  bake(scene, 'bullet', 8, 18, drawBullet)
  bake(scene, 'missile', 12, 26, drawMissile)
  bake(scene, 'eshot', 10, 16, drawEnemyShot)
  bake(scene, 'pickupMissile', 24, 24, drawPickupMissile)
  bake(scene, 'pickupWeapon', 24, 24, drawPickupWeapon)
}
