// Hauptszene: Spielablauf, Eingaben, Kollisionen und HUD.
// Kollisionen werden per Kreisabstand berechnet (keine Physics-Callbacks),
// dadurch entfällt der Zugriff auf body.gameObject.
import Phaser from 'phaser'
import { createTextures } from '../game/sprites'
import { Background } from '../game/background'
import { weaponSpec, MAX_WEAPON_LEVEL, WEAPON_UPGRADE_POINTS } from '../game/weapons'
import { audio } from '../audio/audio'
import { t } from '../i18n'
const W = 960
const H = 540
const START_LIVES = 5
const START_MISSILES = 3
const MISSILE_PICKUP_AMOUNT = 2
const MAX_MISSILES = 20
const RESPAWN_INVULN_S = 1.5
const EXTRA_LIFE_EVERY = 5000
const MAX_LEVEL = 50
const BOSS_EVERY = 5
const INTERMISSION_S = 1.6
const HINT_S = 7
// Schutzschild: Vorstufe zum Leben. Treffer ziehen zuerst vom Schild ab.
const PLAYER_SHIELD_MAX = 100
const SHOT_DAMAGE = 35
const SHAKE_THRESHOLD = 12 // Schwellwert fuer Schuetteln (Betrag der Beschleunigung minus Erdbeschleunigung)
const ROCKET_DAMAGE = 50
const SHIELD_HIT_INVULN_S = 0.4
const SHIELD_PICKUP_CHANCE = 0.04
const PLAYER_SPEED = 380
const PLAYER_Y_SPEED = 220
const PLAYER_MIN_Y = 170 // Schiff kann weiter nach vorne (oben) fliegen
const PLAYER_MAX_Y = H - 40
const PLAYER_START_Y = H - 70
const PLAYER_RADIUS = 18
const PLAYER_EDGE = 24
const BULLET_SPEED = 620
const BULLET_RADIUS = 8
const SHOT_RADIUS = 5
const ENEMY_DIVE_SPEED = 140
const ENEMY_HP_GROWTH = 0.25 // Gegner-Leben steigt pro Level um diesen Anteil
const ENEMY_FIRE_SPEEDUP = 0.012 // Feuerrate steigt pro Level (max. 50 %)
const ENEMY_HOME_MAX_Y = H * 0.6 // Formationen liegen maximal in diesem Bereich
const ENEMY_DRIFT_BASE = 40 // Grundgeschwindigkeit der freien Gegnerbewegung (px/s)
const ENEMY_MIN_Y = 60 // Gegner bleiben innerhalb des Bildschirms
const ENEMY_MAX_Y = H - 110
const ENEMY_DRIFT_PER_LEVEL = 1.5
const ENEMY_ROCKET_SPEED = 150
const ENEMY_ROCKET_SPEED_PER_LEVEL = 3
const ENEMY_ROCKET_TURN = 1.5 // radians per second
const ENEMY_ROCKET_TURN_PER_LEVEL = 0.08
const ENEMY_ROCKET_LIFE_S = 5
const ENEMY_ROCKET_RADIUS = 10
const MARK_CHANCE = 0.12
const WEAPON_DROP_CHANCE = 0.03
const PICKUP_RADIUS = 12
const PICKUP_FALL_SPEED = 90
const BOSS_RADIUS = 60
const BOSS_EDGE = 110
const BOSS_Y = 120
const BOSS_BASE_HP = 300
const BOSS_HP_PER_LEVEL = 60
const BOSS_HELPER_EVERY_S = 6 // Boss schickt laufend neue Helfer
const BOSS_HELPER_COUNT = 2
const BOSS_HELPER_MAX = 8 // max. gleichzeitig lebende Helfer
const BOSS_ROCKET_EVERY_S = 3.5
const BOSS_ROCKET_SPEED = 150
const BOSS_ROCKET_TURN = 1.6 // radians per second
const BOSS_ROCKET_LIFE_S = 6
const BOSS_ROCKET_RADIUS = 10
// Raketen werden mit steigendem Level zaeher und bekommen eine andere Farbe
const ROCKET_TIERS: { minLevel: number; hp: number; tint: number }[] = [
    { minLevel: 1, hp: 1, tint: 0xffaa55 }, // orange
    { minLevel: 4, hp: 2, tint: 0xff55ff }, // magenta
    { minLevel: 8, hp: 3, tint: 0xff3333 }, // rot
    { minLevel: 13, hp: 4, tint: 0x3399ff }, // blau
    { minLevel: 18, hp: 6, tint: 0xaa55ff }, // lila
]
const BOSS_BAR_W = 320
const BOSS_BAR_Y = 52
const MISSILE_SPEED = 380
const MISSILE_TURN_RATE = 5 // radians per second
const MISSILE_LIFE_S = 3.5
const MISSILE_RADIUS = 70 // explosion reach
const MISSILE_DAMAGE = 3
const MISSILE_COOLDOWN_MS = 150
const MISSILE_HIT_RADIUS = 12
const MISSILE_SPREAD = 60
const SHIELD_EVERY_S = 9
const SHIELD_HP = 3
const SHIELD_RADIUS = 30
type EnemyKind = 'enemyBug' | 'enemySaucer' | 'enemyFighter'
interface EnemyStats {
    hp: number
    points: number
    fireEvery: number // seconds between shots
    shotSpeed: number
    radius: number
    minLevel: number
    rocketEvery: number // seconds between homing rockets, 0 = none
}
const ENEMY_STATS: Record<EnemyKind, EnemyStats> = {
    enemyBug: { hp: 3, points: 100, fireEvery: 2.6, shotSpeed: 200, radius: 22, minLevel: 1, rocketEvery: 0 },
    enemySaucer: { hp: 5, points: 250, fireEvery: 2.0, shotSpeed: 240, radius: 24, minLevel: 3, rocketEvery: 5 },
    enemyFighter: { hp: 7, points: 400, fireEvery: 1.5, shotSpeed: 280, radius: 26, minLevel: 6, rocketEvery: 3 },
}
type State = 'playing' | 'intermission' | 'paused' | 'over' | 'won'
interface Circle {
    x: number
    y: number
    radius: number
}
interface Obj extends Circle {
    img: Phaser.GameObjects.Image
    vx: number
    vy: number
    dead: boolean
}
interface Enemy extends Obj {
    kind: EnemyKind
    hp: number
    maxHp: number
    marked: boolean // marked enemies drop missile widgets
    fireTimer: number
    homeY: number
    rocketTimer: number
}
interface Boss extends Obj {
    hp: number
    maxHp: number
    fireTimer: number
}
interface Bullet extends Obj {
    damage: number
}
interface Missile extends Obj {
    age: number
}
interface EnemyRocket extends Obj {
    age: number
    speed: number
    turn: number // radians per second
    lifeS: number
    hp: number
    tint: number
}
interface Shield extends Obj {
    hp: number // shields absorb enemy shots, missiles detonate on them
}
type PickupKind = 'missile' | 'weapon' | 'shield'
interface Pickup extends Obj {
    kind: PickupKind
}
const PICKUP_TEXTURE: Record<PickupKind, string> = {
    missile: 'pickupMissile',
    weapon: 'pickupWeapon',
    shield: 'pickupShield',
}
function isBossLevel(level: number): boolean {
    return level % BOSS_EVERY === 0
}
function hits(a: Circle, b: Circle): boolean {
    return Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y) < a.radius + b.radius
}
export class GameScene extends Phaser.Scene {
    private background!: Background
    private player!: Phaser.GameObjects.Image
    private state!: State
    private pausedFrom!: 'playing' | 'intermission'
    private px!: number
    private py!: number
    private lives!: number
    private playerShield!: number
    private score!: number
    private level!: number
    private missileAmmo!: number
    private bonusWeapon!: number
    private weaponLevel!: number
    private invulnS!: number
    private clockMs!: number
    private nextFireMs!: number
    private nextMissileMs!: number
    private firing!: boolean
    private tilt!: number
    private tiltY!: number
    private smoothAxisX: number = 0
    private smoothAxisY: number = 0
    private spawned!: number
    private spawnTimerS!: number
    private shieldTimerS!: number
    private bossRocketTimerS!: number
    private bossHelperTimerS!: number
    private intermissionS!: number
    private extraLifeAt!: number
    private hintS!: number
    private messageS!: number
    private boss!: Boss | null
    private enemies!: Enemy[]
    private shots!: Obj[]
    private bullets!: Bullet[]
    private rockets!: Missile[]
    private enemyRockets!: EnemyRocket[]
    private shields!: Shield[]
    private pickups!: Pickup[]
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
    private keyFire?: Phaser.Input.Keyboard.Key
    private keyMissile?: Phaser.Input.Keyboard.Key
    private keyRestart?: Phaser.Input.Keyboard.Key
    private keyPause?: Phaser.Input.Keyboard.Key
    private keyAutofire?: Phaser.Input.Keyboard.Key
    private autofire!: boolean
    private autofireText!: Phaser.GameObjects.Text
    private scoreText!: Phaser.GameObjects.Text
    private livesText!: Phaser.GameObjects.Text
    private shieldText!: Phaser.GameObjects.Text
    private shieldCircle!: Phaser.GameObjects.Graphics
    private shieldStroke!: Phaser.GameObjects.Graphics
    private levelText!: Phaser.GameObjects.Text
    private ammoText!: Phaser.GameObjects.Text
    private weaponText!: Phaser.GameObjects.Text
    private pauseText!: Phaser.GameObjects.Text
    private messageText!: Phaser.GameObjects.Text
    private hintText!: Phaser.GameObjects.Text
    private overlayText!: Phaser.GameObjects.Text
    private bossBar!: Phaser.GameObjects.Rectangle
    private onTilt = (gamma: number, beta: number): void => {
        this.tilt = gamma
        this.tiltY = beta
    }
    private onShake = (magnitude: number): void => {
        const strength = Math.abs(magnitude)
        if (strength < SHAKE_THRESHOLD) return
        // Intensity sets the salvo size; repeated shake events add more salvos over time
        this.fireMissiles(Math.min(3, Math.floor(strength / 3)))
    }
    private onPointerDown = (pointer: Phaser.Input.Pointer): void => {
        // Tap on the pause button toggles pause (works in both directions)
        if (this.pauseText.visible && this.pauseText.getBounds().contains(pointer.x, pointer.y)) {
            this.togglePause()
            return
        }
        // Tap on the autofire button toggles continuous fire (does not start a manual shot)
        if (this.autofireText.visible && this.autofireText.getBounds().contains(pointer.x, pointer.y)) {
            this.toggleAutofire()
            return
        }
        if (this.state === 'paused') return
        if (this.state === 'over' || this.state === 'won') {
            this.scene.restart()
            return
        }
        this.firing = true
    }
    private onPointerUp = (): void => {
        this.firing = false
    }
    constructor() {
        super('GameScene')
    }
    // Called before every start and restart: resets all run state
    init(): void {
        this.state = 'playing'
        this.pausedFrom = 'playing'
        this.px = W / 2
        this.py = PLAYER_START_Y
        this.lives = START_LIVES
        this.playerShield = PLAYER_SHIELD_MAX
        this.score = 0
        this.level = 1
        this.missileAmmo = START_MISSILES
        this.bonusWeapon = 0
        this.weaponLevel = 1
        this.invulnS = 0
        this.clockMs = 0
        this.nextFireMs = 0
        this.nextMissileMs = 0
        this.firing = false
        this.autofire = false
        this.tilt = 0
        this.tiltY = 0
        this.spawned = 0
        this.spawnTimerS = 0
        this.shieldTimerS = SHIELD_EVERY_S
        this.bossRocketTimerS = BOSS_ROCKET_EVERY_S
        this.intermissionS = 0
        this.extraLifeAt = EXTRA_LIFE_EVERY
        this.hintS = HINT_S
        this.messageS = 0
        this.boss = null
        this.enemies = []
        this.shots = []
        this.bullets = []
        this.rockets = []
        this.enemyRockets = []
        this.shields = []
        this.pickups = []
    }
    create(): void {
        createTextures(this)
        this.makeShieldTexture()
        this.makePickupShieldTexture()
        this.background = new Background(this, W, H)
        this.player = this.add.image(this.px, this.py, 'player').setDepth(10)
        this.shieldCircle = this.add.graphics().setDepth(9)
        this.shieldStroke = this.add.graphics().setDepth(9)
        this.shieldCircle.setVisible(false)
        this.shieldStroke.setVisible(false)
        this.createHud()
        const kb = this.input.keyboard
        this.cursors = kb?.createCursorKeys()
        this.keyFire = kb?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        this.keyMissile = kb?.addKey(Phaser.Input.Keyboard.KeyCodes.X)
        this.keyRestart = kb?.addKey(Phaser.Input.Keyboard.KeyCodes.R)
        this.keyPause = kb?.addKey(Phaser.Input.Keyboard.KeyCodes.P)
        this.keyAutofire = kb?.addKey(Phaser.Input.Keyboard.KeyCodes.F)
        this.game.events.on('tilt', this.onTilt)
        this.game.events.on('shake', this.onShake)
        this.input.on('pointerdown', this.onPointerDown)
        this.input.on('pointerup', this.onPointerUp)
        this.input.on('pointerupoutside', this.onPointerUp)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this)
        this.startLevel()
    }
    update(_time: number, deltaMs: number): void {
        const dt = Math.min(deltaMs, 50) / 1000
        if (this.keyPause && Phaser.Input.Keyboard.JustDown(this.keyPause)) this.togglePause()
        if (this.state === 'paused') return
        if (this.keyAutofire && Phaser.Input.Keyboard.JustDown(this.keyAutofire)) this.toggleAutofire()
        this.clockMs += dt * 1000
        this.background.update(dt)
        if (this.state === 'over' || this.state === 'won') {
            if (this.keyRestart && Phaser.Input.Keyboard.JustDown(this.keyRestart)) this.scene.restart()
            return
        }
        if (this.keyMissile && Phaser.Input.Keyboard.JustDown(this.keyMissile)) this.fireMissiles(1)
        this.updatePlayer(dt)
        this.updateFire()
        if (this.state === 'intermission') {
            this.intermissionS -= dt
            if (this.intermissionS <= 0) this.startLevel()
        }
        this.updateWaves(dt)
        this.updateEnemies(dt)
        this.updateBoss(dt)
        this.updateMovers(dt)
        this.updateRockets(dt)
        this.updateEnemyRockets(dt)
        this.checkCollisions()
        this.reap()
        this.checkLevelComplete()
        this.messageS -= dt
        this.messageText.setVisible(this.messageS > 0)
        this.hintS -= dt
        this.hintText.setVisible(this.hintS > 0)
        this.updateHud()
    }
    // ---------- Level flow ----------
    private quota(): number {
        return isBossLevel(this.level) ? 0 : 8 + this.level * 2
    }
    private startLevel(): void {
        this.state = 'playing'
        this.spawned = 0
        this.spawnTimerS = 0.8
        if (isBossLevel(this.level)) {
            audio.setScene('boss')
            this.spawnBoss()
            this.showMessage(t('bossWarning'), 2200)
        } else {
            audio.setScene('level')
            this.showMessage(t('levelStart', { level: this.level }), 1800)
        }
    }
    private completeLevel(): void {
        if (this.state !== 'playing') return
        if (this.level >= MAX_LEVEL) {
            this.finish('won')
            return
        }
        this.level++
        this.state = 'intermission'
        this.intermissionS = INTERMISSION_S
    }
    private checkLevelComplete(): void {
        if (this.state !== 'playing' || this.boss) return
        if (this.spawned >= this.quota() && this.enemies.length === 0) this.completeLevel()
    }
    private finish(result: 'over' | 'won'): void {
        this.state = result
        this.firing = false
        this.pauseText.setVisible(false)
        const head = result === 'won' ? t('victory') : t('gameOver')
        this.overlayText.setText(`${head}\n${t('finalScore', { score: this.score })}\n\n${t('restart')}`)
        this.overlayText.setVisible(true)
    }
    // Pause toggles between the running state and 'paused'; time and spawns stop meanwhile
    private togglePause(): void {
        if (this.state === 'paused') {
            this.state = this.pausedFrom
            this.overlayText.setVisible(false)
            audio.audioContext?.resume()
            return
        }
        if (this.state !== 'playing' && this.state !== 'intermission') return
        this.pausedFrom = this.state
        this.state = 'paused'
        this.firing = false
        this.overlayText.setText(`${t('paused')}\n\n${t('resume')}`).setVisible(true)
        audio.audioContext?.suspend()
    }
    // Dauerfeuer: schießt ohne gedrückte Taste/Berührung durchgehend
    private toggleAutofire(): void {
        if (this.state !== 'playing' && this.state !== 'intermission') return
        this.autofire = !this.autofire
        this.showMessage(t(this.autofire ? 'autofireOn' : 'autofireOff'), 1200)
    }
    private cleanup(): void {
        this.game.events.off('tilt', this.onTilt)
        this.game.events.off('shake', this.onShake)
        this.input.off('pointerdown', this.onPointerDown)
        this.input.off('pointerup', this.onPointerUp)
        this.input.off('pointerupoutside', this.onPointerUp)
        this.shieldCircle.destroy()
        this.shieldStroke.destroy()
    }
    // ---------- Player ----------
    private get playerCircle(): Circle {
        return { x: this.px, y: this.py, radius: PLAYER_RADIUS }
    }
    private updatePlayer(dt: number): void {
        const keyX = (this.cursors?.left.isDown ? -1 : 0) + (this.cursors?.right.isDown ? 1 : 0)
        const tiltX = Phaser.Math.Clamp(this.tilt / 22.5, -1, 1)
        const targetX = Phaser.Math.Clamp(keyX + tiltX, -1, 1)
        this.smoothAxisX = Phaser.Math.Linear(this.smoothAxisX, targetX, 0.12)
        this.px = Phaser.Math.Clamp(this.px + this.smoothAxisX * PLAYER_SPEED * dt, PLAYER_EDGE, W - PLAYER_EDGE)
        const keyY = (this.cursors?.down.isDown ? 1 : 0) - (this.cursors?.up.isDown ? 1 : 0)
        const tiltY = Phaser.Math.Clamp(this.tiltY / 22.5, -1, 1)
        const targetY = Phaser.Math.Clamp(keyY + tiltY, -1, 1)
        this.smoothAxisY = Phaser.Math.Linear(this.smoothAxisY, targetY, 0.12)
        this.py = Phaser.Math.Clamp(this.py + this.smoothAxisY * PLAYER_Y_SPEED * dt, PLAYER_MIN_Y, PLAYER_MAX_Y)
        this.invulnS = Math.max(0, this.invulnS - dt)
        const blink = this.invulnS > 0 && Math.floor(this.clockMs / 100) % 2 === 0
        this.player.setPosition(this.px, this.py).setAlpha(blink ? 0.3 : 1)
        this.shieldCircle.clear()
        this.shieldStroke.clear()
        const shieldRatio = this.playerShield / PLAYER_SHIELD_MAX
        const visible = shieldRatio > 0
        this.shieldCircle.setVisible(visible)
        this.shieldStroke.setVisible(visible)
        if (visible) {
            const alpha = 0.05 + 0.2 * shieldRatio
            this.shieldCircle.fillStyle(0x00ccff, alpha).fillCircle(this.px, this.py, PLAYER_RADIUS + 6)
            this.shieldStroke.lineStyle(2, 0x66e0ff, 0.2 + 0.8 * shieldRatio).strokeCircle(this.px, this.py, PLAYER_RADIUS + 6)
        }
    }
    // Damage first drains the shield; only without shield a hit costs one life
    private hitPlayer(damage: number): void {
        if (this.invulnS > 0 || this.state === 'over' || this.state === 'won') return
        audio.sfx('hit')
        if (this.playerShield > 0) {
            this.playerShield = Math.max(0, this.playerShield - damage)
            this.invulnS = SHIELD_HIT_INVULN_S
            return
        }
        this.lives--
        for (const s of this.shots) s.dead = true
        for (const r of this.enemyRockets) r.dead = true
        this.px = W / 2
        this.py = PLAYER_START_Y
        this.playerShield = PLAYER_SHIELD_MAX
        this.shieldCircle.setVisible(true)
        this.invulnS = RESPAWN_INVULN_S
        if (this.lives <= 0) this.finish('over')
    }
    private updateFire(): void {
        const holding = this.autofire || this.firing || Boolean(this.keyFire?.isDown)
        if (this.state !== 'playing' || !holding || this.clockMs < this.nextFireMs) return
        const spec = weaponSpec(this.weaponLevel)
        for (const s of spec.shots) {
            const rad = Phaser.Math.DegToRad(s.angle)
            // Muzzle sits in the shot direction in front of the ship (behind it for backward shots)
            const sx = this.px + s.offset + Math.sin(rad) * 24
            const sy = this.py - Math.cos(rad) * 24
            const b: Bullet = {
                ...this.makeObj('bullet', sx, sy, Math.sin(rad) * BULLET_SPEED, -Math.cos(rad) * BULLET_SPEED, BULLET_RADIUS, 4),
                damage: spec.damage,
            }
            if (s.angle !== 0) b.img.setRotation(rad)
            this.bullets.push(b)
        }
        this.nextFireMs = this.clockMs + spec.cooldownMs
        audio.sfx('shot')
    }
    // ---------- Missiles ----------
    private fireMissiles(count: number): void {
        if (this.state !== 'playing' || this.missileAmmo <= 0 || this.clockMs < this.nextMissileMs) return
        const n = Math.min(count, this.missileAmmo)
        this.missileAmmo -= n
        this.nextMissileMs = this.clockMs + MISSILE_COOLDOWN_MS
        for (let i = 0; i < n; i++) {
            const spread = (i - (n - 1) / 2) * MISSILE_SPREAD
            const m: Missile = {
                ...this.makeObj('missile', this.px, this.py - 20, spread, -MISSILE_SPEED, MISSILE_HIT_RADIUS, 7),
                age: 0,
            }
            this.rockets.push(m)
        }
        audio.sfx('shot')
    }
    private nearestTarget(from: Circle): Circle | null {
        const candidates: Circle[] = this.enemies.filter((e) => !e.dead)
        if (this.boss && !this.boss.dead) candidates.push(this.boss)
        let best: Circle | null = null
        let bestDist = Infinity
        for (const c of candidates) {
            const d = Phaser.Math.Distance.Between(from.x, from.y, c.x, c.y)
            if (d < bestDist) {
                bestDist = d
                best = c
            }
        }
        return best
    }
    // Homing: steer towards a target with a limited turn rate
    private steer(m: Obj, target: Circle | null, speed: number, turnRate: number, dt: number): void {
        const angle = Math.atan2(m.vy, m.vx)
        let newAngle = angle
        if (target) {
            const desired = Math.atan2(target.y - m.y, target.x - m.x)
            const diff = Phaser.Math.Angle.Wrap(desired - angle)
            const maxTurn = turnRate * dt
            newAngle = angle + Phaser.Math.Clamp(diff, -maxTurn, maxTurn)
        }
        m.vx = Math.cos(newAngle) * speed
        m.vy = Math.sin(newAngle) * speed
        this.advance(m, dt)
        m.img.setRotation(Math.atan2(m.vx, -m.vy))
    }
    private updateRockets(dt: number): void {
        for (const m of this.rockets) {
            if (m.dead) continue
            m.age += dt
            if (m.age > MISSILE_LIFE_S || m.y < -40 || m.x < -40 || m.x > W + 40) {
                m.dead = true
                continue
            }
            this.steer(m, this.nearestTarget(m), MISSILE_SPEED, MISSILE_TURN_RATE, dt)
        }
    }
    // Homing rockets of bosses and enemies steer towards the player and can be shot down
    private updateEnemyRockets(dt: number): void {
        for (const r of this.enemyRockets) {
            if (r.dead) continue
            r.age += dt
            if (r.age > r.lifeS || r.y > H + 80 || r.x < -80 || r.x > W + 80) {
                r.dead = true
                continue
            }
            this.steer(r, this.playerCircle, r.speed, r.turn, dt)
        }
    }
    private touchesAnything(m: Missile): boolean {
        return (
            this.enemies.some((e) => !e.dead && hits(m, e)) ||
            (this.boss !== null && !this.boss.dead && hits(m, this.boss)) ||
            this.shots.some((s) => !s.dead && hits(m, s)) ||
            this.enemyRockets.some((r) => !r.dead && hits(m, r)) ||
            this.shields.some((sh) => !sh.dead && hits(m, sh)) ||
            this.rockets.some((o) => o !== m && !o.dead && hits(m, o))
        )
    }
    private detonate(m: Missile): void {
        if (m.dead) return
        m.dead = true
        audio.sfx('explode')
        this.blast(m.x, m.y, MISSILE_RADIUS, 0x6fffb0)
        const reach = (target: Circle): boolean =>
            Phaser.Math.Distance.Between(m.x, m.y, target.x, target.y) < MISSILE_RADIUS + target.radius
        for (const e of this.enemies) {
            if (!e.dead && reach(e)) this.damageEnemy(e, MISSILE_DAMAGE)
        }
        if (this.boss && !this.boss.dead && reach(this.boss)) this.damageBoss(MISSILE_DAMAGE)
        for (const s of this.shots) {
            if (!s.dead && reach(s)) s.dead = true
        }
        for (const r of this.enemyRockets) {
            if (!r.dead && reach(r)) this.damageRocket(r, MISSILE_DAMAGE)
        }
        for (const sh of this.shields) {
            if (!sh.dead && reach(sh)) sh.dead = true
        }
        // Chain reaction: other missiles in range detonate as well
        for (const o of this.rockets) {
            if (!o.dead && reach(o)) this.detonate(o)
        }
    }
    // ---------- Enemies & boss ----------
    private randomKind(): EnemyKind {
        const kinds = (Object.keys(ENEMY_STATS) as EnemyKind[]).filter((k) => ENEMY_STATS[k].minLevel <= this.level)
        return kinds[Math.floor(Math.random() * kinds.length)]
    }
    // Enemies get tougher and shoot faster with every level
    private fireDelay(base: number): number {
        const speedup = Math.min(0.5, this.level * ENEMY_FIRE_SPEEDUP)
        return base * (1 - speedup) * (0.7 + Math.random() * 0.6)
    }
    private spawnRow(): void {
        const kind = this.randomKind()
        const count = Math.min(3, this.quota() - this.spawned)
        const homeY = 80 + Math.random() * (ENEMY_HOME_MAX_Y - 80)
        for (let i = 0; i < count; i++) {
            this.createEnemy(kind, (W * (i + 1)) / (count + 1), -30, homeY)
            this.spawned++
        }
    }
    private createEnemy(kind: EnemyKind, x: number, y: number, homeY: number): Enemy {
        const stats = ENEMY_STATS[kind]
        const dir = Math.random() < 0.5 ? -1 : 1
        const speed = (ENEMY_DRIFT_BASE + this.level * ENEMY_DRIFT_PER_LEVEL) * (0.8 + Math.random() * 0.4)
        const vy = Math.random() < 0.5 ? -speed : speed
        const hp = Math.round(stats.hp * (1 + (this.level - 1) * ENEMY_HP_GROWTH))
        const e: Enemy = {
            ...this.makeObj(kind, x, y, dir * (40 + this.level * 2), vy, stats.radius, 5),
            kind,
            hp,
            maxHp: hp,
            marked: Math.random() < MARK_CHANCE,
            fireTimer: this.fireDelay(stats.fireEvery),
            homeY,
            rocketTimer: stats.rocketEvery > 0 ? this.fireDelay(stats.rocketEvery) : Infinity,
        }
        this.enemies.push(e)
        return e
    }
    private spawnBoss(): void {
        const hp = BOSS_BASE_HP + this.level * BOSS_HP_PER_LEVEL
        const boss: Boss = {
            ...this.makeObj('boss', W / 2, BOSS_Y, 110 + this.level * 2, 0, BOSS_RADIUS, 5),
            hp,
            maxHp: hp,
            fireTimer: 1.2,
        }
        this.boss = boss
        this.bossRocketTimerS = BOSS_ROCKET_EVERY_S
        this.bossHelperTimerS = BOSS_HELPER_EVERY_S
    }
    private updateWaves(dt: number): void {
        if (this.state !== 'playing') return
        this.spawnTimerS -= dt
        if (this.spawnTimerS <= 0 && this.spawned < this.quota()) {
            this.spawnRow()
            this.spawnTimerS = Math.max(0.45, 1.1 - this.level * 0.012)
        }
        this.shieldTimerS -= dt
        if (this.shieldTimerS <= 0) {
            this.spawnShield()
            this.shieldTimerS = SHIELD_EVERY_S
        }
    }
    private updateEnemies(dt: number): void {
        for (const e of this.enemies) {
            if (e.dead) continue
            e.x += e.vx * dt
            if (e.x < 40 || e.x > W - 40) {
                e.vx = -e.vx
                e.x = Phaser.Math.Clamp(e.x, 40, W - 40)
            }
            // Dive to the formation height, then roam freely inside the screen
            if (e.y < e.homeY) {
                e.y = Math.min(e.homeY, e.y + ENEMY_DIVE_SPEED * dt)
            } else {
                e.y += e.vy * dt
                if (e.y < ENEMY_MIN_Y || e.y > ENEMY_MAX_Y) {
                    e.vy = -e.vy
                    e.y = Phaser.Math.Clamp(e.y, ENEMY_MIN_Y, ENEMY_MAX_Y)
                }
            }
            e.img.setPosition(e.x, e.y)
            e.fireTimer -= dt
            if (e.fireTimer <= 0 && this.state === 'playing' && e.y > 0) {
                const stats = ENEMY_STATS[e.kind]
                this.fireShot(e.x, e.y + e.radius, stats.shotSpeed + this.level * 3)
                e.fireTimer = this.fireDelay(stats.fireEvery)
            }
            e.rocketTimer -= dt
            if (e.rocketTimer <= 0 && this.state === 'playing' && e.y > 0) {
                this.spawnEnemyRocket(e.x, e.y + e.radius, ENEMY_ROCKET_SPEED + this.level * ENEMY_ROCKET_SPEED_PER_LEVEL, ENEMY_ROCKET_TURN + this.level * ENEMY_ROCKET_TURN_PER_LEVEL, ENEMY_ROCKET_LIFE_S, ENEMY_ROCKET_RADIUS)
                e.rocketTimer = this.fireDelay(ENEMY_STATS[e.kind].rocketEvery)
            }
        }
    }
    private updateBoss(dt: number): void {
        const boss = this.boss
        if (!boss || boss.dead) return
        boss.x += boss.vx * dt
        if (boss.x < BOSS_EDGE || boss.x > W - BOSS_EDGE) {
            boss.vx = -boss.vx
            boss.x = Phaser.Math.Clamp(boss.x, BOSS_EDGE, W - BOSS_EDGE)
        }
        boss.img.setPosition(boss.x, boss.y)
        if (this.state !== 'playing') return
        // Index grows with every boss: more guns, more rockets
        const index = Math.floor(this.level / BOSS_EVERY)
        boss.fireTimer -= dt
        if (boss.fireTimer <= 0) {
            const n = Math.min(9, 3 + index * 2)
            for (let i = 0; i < n; i++) {
                const dx = (i - (n - 1) / 2) * 30
                this.fireShot(boss.x + dx, boss.y + 50, 230 + this.level * 3)
            }
            boss.fireTimer = Math.max(0.7, 1.3 - this.level * 0.01)
        }
        this.bossRocketTimerS -= dt
        if (this.bossRocketTimerS <= 0) {
            this.bossRocketTimerS = BOSS_ROCKET_EVERY_S
            const n = Math.min(6, 2 + index)
            for (let i = 0; i < n; i++) {
                const dx = (i - (n - 1) / 2) * 40
                this.spawnEnemyRocket(boss.x + dx, boss.y + 40, BOSS_ROCKET_SPEED, BOSS_ROCKET_TURN, BOSS_ROCKET_LIFE_S, BOSS_ROCKET_RADIUS)
            }
        }
        // Helpers keep arriving while the boss is alive
        this.bossHelperTimerS -= dt
        if (this.bossHelperTimerS <= 0) {
            this.bossHelperTimerS = BOSS_HELPER_EVERY_S
            this.spawnHelpers(boss)
        }
    }
    private spawnHelpers(boss: Boss): void {
        const alive = this.enemies.filter((e) => !e.dead).length
        const n = Math.min(BOSS_HELPER_COUNT, BOSS_HELPER_MAX - alive)
        for (let i = 0; i < n; i++) {
            const x = boss.x + (i - (n - 1) / 2) * 70
            const homeY = 80 + Math.random() * (ENEMY_HOME_MAX_Y - 80)
            this.createEnemy(this.randomKind(), x, -30, homeY)
        }
    }
    // Rocket strength depends on the current level (tier table above)
    private rocketTier(): { hp: number; tint: number } {
        let tier = ROCKET_TIERS[0]
        for (const t of ROCKET_TIERS) if (this.level >= t.minLevel) tier = t
        return tier
    }
    private spawnEnemyRocket(x: number, y: number, speed: number, turn: number, lifeS: number, radius: number): void {
        const tier = this.rocketTier()
        const r: EnemyRocket = {
            ...this.makeObj('missile', x, y, 0, speed, radius, 6),
            age: 0,
            speed,
            turn,
            lifeS,
            hp: tier.hp,
            tint: tier.tint,
        }
        r.img.setTint(tier.tint)
        this.enemyRockets.push(r)
    }
    private damageRocket(r: EnemyRocket, dmg: number): void {
        if (r.dead) return
        r.hp -= dmg
        if (r.hp > 0) return
        r.dead = true
        this.blast(r.x, r.y, 24, r.tint)
    }
    private fireShot(x: number, y: number, speed: number): void {
        this.shots.push(this.makeObj('eshot', x, y, 0, speed, SHOT_RADIUS, 6))
    }
    private damageEnemy(e: Enemy, dmg: number): void {
        if (e.dead) return
        e.hp -= dmg
        if (e.hp > 0) {
            // Damaged enemies become more transparent
            e.img.setAlpha(0.35 + 0.65 * (e.hp / e.maxHp))
            return
        }
        e.dead = true
        this.addScore(ENEMY_STATS[e.kind].points)
        audio.sfx('explode')
        this.blast(e.x, e.y, 36, 0xffaa33)
        if (e.marked) {
            this.spawnPickup('missile', e.x, e.y)
            return
        }
        const roll = Math.random()
        if (roll < WEAPON_DROP_CHANCE) this.spawnPickup('weapon', e.x, e.y)
        else if (roll < WEAPON_DROP_CHANCE + SHIELD_PICKUP_CHANCE) this.spawnPickup('shield', e.x, e.y)
    }
    private damageBoss(dmg: number): void {
        const boss = this.boss
        if (!boss || boss.dead) return
        boss.hp -= dmg
        if (boss.hp > 0) {
            boss.img.setAlpha(0.5 + 0.5 * (boss.hp / boss.maxHp))
            return
        }
        boss.dead = true
        for (const e of this.enemies) {
            if (e.dead) continue
            e.dead = true
            this.blast(e.x, e.y, 36, 0xffaa33)
        }
        this.addScore(2000)
        audio.sfx('explode')
        this.blast(boss.x, boss.y, 90, 0xff4444)
        // Boss drops: guaranteed shield recharge and a missile widget
        this.spawnPickup('shield', boss.x, boss.y)
        this.spawnPickup('missile', boss.x + 40, boss.y)
        for (const r of this.enemyRockets) r.dead = true
        this.completeLevel()
    }
    // ---------- Shields & pickups ----------
    private spawnShield(): void {
        const x = 90 + Math.random() * (W - 180)
        const dir = Math.random() < 0.5 ? -1 : 1
        const sh: Shield = {
            ...this.makeObj('shield', x, -40, dir * 30, 45, SHIELD_RADIUS, 3),
            hp: SHIELD_HP,
        }
        this.shields.push(sh)
    }
    private spawnPickup(kind: PickupKind, x: number, y: number): void {
        const p: Pickup = {
            ...this.makeObj(PICKUP_TEXTURE[kind], x, y, 0, PICKUP_FALL_SPEED, PICKUP_RADIUS, 8),
            kind,
        }
        this.pickups.push(p)
    }
    // ---------- Score & weapon ----------
    private addScore(points: number): void {
        this.score += points
        while (this.score >= this.extraLifeAt) {
            this.extraLifeAt += EXTRA_LIFE_EVERY
            this.lives++
            this.showMessage(t('extraLife'), 1500)
        }
        this.refreshWeapon()
    }
    private refreshWeapon(): void {
        const next = Math.min(MAX_WEAPON_LEVEL, 1 + Math.floor(this.score / WEAPON_UPGRADE_POINTS) + this.bonusWeapon)
        if (next > this.weaponLevel) {
            this.weaponLevel = next
            this.showMessage(t('weaponUp', { level: next }), 1800)
        }
    }
    // ---------- Movement & collisions ----------
    private makeObj(key: string, x: number, y: number, vx: number, vy: number, radius: number, depth: number): Obj {
        const img = this.add.image(x, y, key).setDepth(depth)
        return { img, x, y, vx, vy, radius, dead: false }
    }
    private advance(o: Obj, dt: number): void {
        o.x += o.vx * dt
        o.y += o.vy * dt
        o.img.setPosition(o.x, o.y)
    }
    private updateMovers(dt: number): void {
        for (const b of this.bullets) {
            this.advance(b, dt)
            if (b.y < -30 || b.y > H + 30 || b.x < -30 || b.x > W + 30) b.dead = true
        }
        for (const s of this.shots) {
            this.advance(s, dt)
            if (s.y > H + 30) s.dead = true
        }
        for (const p of this.pickups) {
            this.advance(p, dt)
            if (p.y > H + 30) p.dead = true
        }
        for (const sh of this.shields) {
            this.advance(sh, dt)
            if (sh.x < 40 || sh.x > W - 40) {
                sh.vx = -sh.vx
                sh.x = Phaser.Math.Clamp(sh.x, 40, W - 40)
                sh.img.setPosition(sh.x, sh.y)
            }
            sh.img.setAlpha(0.35 + 0.65 * (sh.hp / SHIELD_HP))
            if (sh.y > H + 60) sh.dead = true
        }
    }
    // Enemy shots and boss rockets: shields absorb them first, otherwise they hit the player
    private checkEnemyProjectiles(list: Obj[], damage: number): void {
        for (const s of list) {
            if (s.dead) continue
            const shield = this.shields.find((sh) => !sh.dead && hits(s, sh))
            if (shield) {
                s.dead = true
                shield.hp -= 1
                if (shield.hp <= 0) {
                    shield.dead = true
                    this.blast(shield.x, shield.y, 30, 0x66e0ff)
                }
                continue
            }
            if (hits(s, this.playerCircle)) {
                s.dead = true
                this.hitPlayer(damage)
            }
        }
    }
    private checkCollisions(): void {
        // Player bullets: enemies first, then boss rockets, then the boss
        for (const b of this.bullets) {
            if (b.dead) continue
            const target = this.enemies.find((e) => !e.dead && hits(b, e))
            if (target) {
                b.dead = true
                this.damageEnemy(target, b.damage)
                continue
            }
            const rocket = this.enemyRockets.find((r) => !r.dead && hits(b, r))
            if (rocket) {
                b.dead = true
                this.damageRocket(rocket, b.damage)
                continue
            }
            if (this.boss && !this.boss.dead && hits(b, this.boss)) {
                b.dead = true
                this.damageBoss(b.damage)
            }
        }
        // Missiles detonate on contact with enemies, boss, enemy shots, boss rockets, shields or other missiles
        for (const m of this.rockets) {
            if (!m.dead && this.touchesAnything(m)) this.detonate(m)
        }
        this.checkEnemyProjectiles(this.shots, SHOT_DAMAGE)
        this.checkEnemyProjectiles(this.enemyRockets, ROCKET_DAMAGE)
        // Contact with an enemy destroys it and counts as a hit, same as a shot
        for (const e of this.enemies) {
            if (!e.dead && hits(e, this.playerCircle)) {
                this.damageEnemy(e, e.hp)
                this.hitPlayer(SHOT_DAMAGE)
            }
        }
        if (this.boss && !this.boss.dead && hits(this.boss, this.playerCircle)) this.hitPlayer(ROCKET_DAMAGE)
        // Pickups
        for (const p of this.pickups) {
            if (p.dead || !hits(p, this.playerCircle)) continue
            p.dead = true
            audio.sfx('pickup')
            if (p.kind === 'missile') {
                this.missileAmmo = Math.min(MAX_MISSILES, this.missileAmmo + MISSILE_PICKUP_AMOUNT)
            } else if (p.kind === 'shield') {
                this.playerShield = PLAYER_SHIELD_MAX
                this.showMessage(t('shieldCharged'), 1400)
            } else {
                this.bonusWeapon++
                this.refreshWeapon()
            }
        }
    }
    private reap(): void {
        this.enemies = this.reapList(this.enemies)
        this.shots = this.reapList(this.shots)
        this.bullets = this.reapList(this.bullets)
        this.rockets = this.reapList(this.rockets)
        this.enemyRockets = this.reapList(this.enemyRockets)
        this.shields = this.reapList(this.shields)
        this.pickups = this.reapList(this.pickups)
        if (this.boss?.dead) {
            this.boss.img.destroy()
            this.boss = null
        }
    }
    private reapList<T extends Obj>(list: T[]): T[] {
        return list.filter((o) => {
            if (o.dead) {
                o.img.destroy()
                return false
            }
            return true
        })
    }
    // ---------- Effects & HUD ----------
    private blast(x: number, y: number, radius: number, color: number): void {
        const c = this.add.circle(x, y, 12, color, 0.7).setDepth(20)
        this.tweens.add({
            targets: c,
            scale: radius / 12,
            alpha: 0,
            duration: 300,
            onComplete: () => c.destroy(),
        })
    }
    private makeShieldTexture(): void {
        if (this.textures.exists('shield')) return
        const g = this.make.graphics({ x: 0, y: 0 }, false)
        g.fillStyle(0x66e0ff, 0.15).fillCircle(30, 30, 28)
        g.lineStyle(3, 0x66e0ff, 0.9).strokeCircle(30, 30, 28)
        g.generateTexture('shield', 60, 60)
        g.destroy()
    }
    // Shield recharge widget: cyan circle with a white plus
    private makePickupShieldTexture(): void {
        if (this.textures.exists('pickupShield')) return
        const g = this.make.graphics({ x: 0, y: 0 }, false)
        g.fillStyle(0x66e0ff, 0.4).fillCircle(12, 12, 12)
        g.fillStyle(0x66e0ff, 1).fillCircle(12, 12, 9)
        g.lineStyle(2, 0xffffff, 1).strokeCircle(12, 12, 9)
        g.fillStyle(0xffffff, 1).fillRect(10, 6, 4, 12).fillRect(6, 10, 12, 4)
        g.generateTexture('pickupShield', 24, 24)
        g.destroy()
    }
    private showMessage(text: string, ms: number): void {
        this.messageText.setText(text)
        this.messageText.setVisible(true)
        this.messageS = ms / 1000
    }
    private createHud(): void {
        const style: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#e8f7ff',
            stroke: '#000000',
            strokeThickness: 3,
        }
        this.scoreText = this.add.text(16, 12, '', style).setDepth(30)
        this.livesText = this.add.text(16, 36, '', style).setDepth(30)
        this.shieldText = this.add.text(16, 60, '', style).setDepth(30)
        this.levelText = this.add.text(W / 2, 12, '', style).setOrigin(0.5, 0).setDepth(30)
        this.ammoText = this.add.text(W - 16, 12, '', style).setOrigin(1, 0).setDepth(30)
        this.weaponText = this.add.text(W - 16, 36, '', style).setOrigin(1, 0).setDepth(30)
        this.pauseText = this.add
            .text(W - 16, 60, t('pause'), { ...style, fontSize: '16px' })
            .setOrigin(1, 0)
            .setDepth(30)
        this.autofireText = this.add
            .text(W - 16, 84, '', { ...style, fontSize: '16px' })
            .setOrigin(1, 0)
            .setDepth(30)
        this.bossBar = this.add
            .rectangle(W / 2 - BOSS_BAR_W / 2, BOSS_BAR_Y, BOSS_BAR_W, 8, 0xff4444)
            .setOrigin(0, 0.5)
            .setDepth(30)
            .setVisible(false)
        this.messageText = this.add
            .text(W / 2, H * 0.35, '', { ...style, fontSize: '32px' })
            .setOrigin(0.5)
            .setDepth(40)
            .setVisible(false)
        this.hintText = this.add
            .text(W / 2, H - 12, t('hint'), { ...style, fontSize: '14px' })
            .setOrigin(0.5, 1)
            .setDepth(30)
        this.overlayText = this.add
            .text(W / 2, H / 2, '', { ...style, fontSize: '36px', align: 'center' })
            .setOrigin(0.5)
            .setDepth(50)
            .setVisible(false)
    }
    private updateHud(): void {
        this.scoreText.setText(`${t('score')}: ${this.score}`)
        this.livesText.setText(`${t('lives')}: ${Math.max(0, this.lives)}`)
        this.shieldText.setText(`${t('shield')}: ${Math.round(this.playerShield)}%`)
        this.levelText.setText(`${t('level')} ${this.level}`)
        this.ammoText.setText(`${t('missiles')}: ${this.missileAmmo}`)
        this.weaponText.setText(`${t('weapon')}: ${this.weaponLevel}/${MAX_WEAPON_LEVEL}`)
        const canAct = this.state === 'playing' || this.state === 'intermission' || this.state === 'paused'
        this.autofireText.setVisible(canAct)
        this.autofireText.setText(`${t('autofire')}: ${t(this.autofire ? 'on' : 'off')}`)
        this.autofireText.setColor(this.autofire ? '#66ff99' : '#e8f7ff')
        const boss = this.boss
        this.bossBar.setVisible(Boolean(boss && !boss.dead))
        if (boss) this.bossBar.setScale(Phaser.Math.Clamp(boss.hp / boss.maxHp, 0, 1), 1)
    }
}
