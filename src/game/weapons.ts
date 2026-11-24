// Waffen-Upgrades. Jede Stufe enthält die Schüsse der vorherigen Stufen.
export const MAX_WEAPON_LEVEL = 10
// Punkte, nach denen die Waffe automatisch eine Stufe aufsteigt
export const WEAPON_UPGRADE_POINTS = 2500
export interface ShotSpec {
  offset: number // horizontaler Startversatz zum Schiff
  angle: number // Grad: 0 = geradeaus, positiv = rechts, 90 = seitlich rechts, 180 = nach hinten
}
export interface WeaponSpec {
  shots: ShotSpec[]
  cooldownMs: number // Mindestabstand zwischen zwei Salven
  damage: number // Schaden pro normalem Schuss
}
const straight = (offsets: number[]): ShotSpec[] => offsets.map((offset) => ({ offset, angle: 0 }))
const LEVEL5_SHOTS: ShotSpec[] = [
  ...straight([-24, -8, 8, 24]),
  { offset: -20, angle: -30 },
  { offset: 20, angle: 30 },
]
const LEVEL7_SHOTS: ShotSpec[] = [
  ...LEVEL5_SHOTS,
  { offset: 0, angle: -90 },
  { offset: 0, angle: 90 },
  { offset: 0, angle: 180 },
]
const LEVEL9_SHOTS: ShotSpec[] = [
  ...LEVEL7_SHOTS,
  ...straight([-40, 40]),
  { offset: -20, angle: -60 },
  { offset: 20, angle: 60 },
]
const SPECS: Record<number, WeaponSpec> = {
  1: { shots: straight([0]), cooldownMs: 280, damage: 1 },
  2: { shots: straight([-10, 10]), cooldownMs: 250, damage: 1 },
  3: { shots: straight([-16, 0, 16]), cooldownMs: 240, damage: 1 },
  4: {
    shots: [...straight([-18, 0, 18]), { offset: -14, angle: -25 }, { offset: 14, angle: 25 }],
    cooldownMs: 200,
    damage: 1,
  },
  5: { shots: LEVEL5_SHOTS, cooldownMs: 180, damage: 2 },
  6: {
    shots: [...LEVEL5_SHOTS, { offset: 0, angle: -90 }, { offset: 0, angle: 90 }],
    cooldownMs: 170,
    damage: 2,
  },
  7: { shots: LEVEL7_SHOTS, cooldownMs: 160, damage: 3 },
  8: {
    shots: [...LEVEL7_SHOTS, { offset: -20, angle: -60 }, { offset: 20, angle: 60 }],
    cooldownMs: 150,
    damage: 3,
  },
  9: { shots: LEVEL9_SHOTS, cooldownMs: 140, damage: 4 },
  10: {
    shots: [
      ...LEVEL9_SHOTS,
      { offset: -20, angle: -135 },
      { offset: 20, angle: 135 },
    ],
    cooldownMs: 130,
    damage: 5,
  },
}
export function weaponSpec(level: number): WeaponSpec {
  const clamped = Math.min(MAX_WEAPON_LEVEL, Math.max(1, level))
  return SPECS[clamped]
}
