/**
 * Wake Lock – prevent the screen from sleeping during gameplay.
 *
 * Uses the Wake Lock API (`navigator.wakeLock`) for Chrome/Edge/Android.
 * For Safari (no Wake Lock support), falls back to a hidden full-screen
 * element with a continuous CSS animation, which keeps the screen alive
 * on iOS Safari.
 */

let wakeLock: WakeLockSentinel | null = null
let hiddenEl: HTMLDivElement | null = null

/**
 * Attempt to acquire a visual-screen Wake Lock.
 * Returns true if Wake Lock was acquired (or not available → fallback).
 */
async function acquireWakeLock(): Promise<boolean> {
  if (!('wakeLock' in navigator)) return false
  try {
    wakeLock = await (navigator as { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen')
    wakeLock.addEventListener('release', () => {
      wakeLock = null
    })
    return true
  } catch {
    // Wake Lock request failed (not supported, permission denied, etc.)
    return false
  }
}

/**
 * Create a hidden full-screen element with a CSS animation.
 * This serves as a fallback for browsers that don't support Wake Lock
 * (notably iOS Safari). The CSS animation prevents the display from sleeping.
 */
function createFallbackElement(): void {
  hiddenEl = document.createElement('div')
  hiddenEl.id = 'wake-lock-fallback'
  hiddenEl.setAttribute('aria-hidden', 'true')
  document.body.appendChild(hiddenEl)
}

/**
 * Remove the fallback element.
 */
function removeFallbackElement(): void {
  if (hiddenEl) {
    hiddenEl.remove()
    hiddenEl = null
  }
}

/**
 * Call this when gameplay starts – the screen will stay on.
 */
export async function wakeLockOn(): Promise<void> {
  const gotWakeLock = await acquireWakeLock()
  if (!gotWakeLock) {
    createFallbackElement()
  }
}

/**
 * Call this when gameplay ends or the tab becomes hidden –
 * the fallback element is removed and Wake Lock is released.
 */
export function wakeLockOff(): void {
  if (wakeLock) {
    wakeLock.release()
    wakeLock = null
  }
  removeFallbackElement()
}

/**
 * Re-acquire Wake Lock if the document becomes visible again
 * (the lock can be released by the browser when the tab is hidden).
 */
export function onVisibilityChange(): void {
  if (document.hidden) {
    // Release wake lock to save battery while hidden
    wakeLockOff()
  } else {
    wakeLockOn()
  }
}
