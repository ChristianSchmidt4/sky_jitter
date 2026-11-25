import { t } from '../i18n'

/**
 * PWA Update Manager
 *
 * Listens for service worker updates and shows a "Update available" banner
 * that lets the user restart the game with the new version.
 *
 * The Vite PWA plugin is configured with `registerType: 'autoUpdate'`, which
 * means `skipWaiting()` is called automatically when a new SW is detected.
 * This module only handles the UI: showing the banner and handling the restart.
 */
export const updateManager = {
  bannerEl: null as HTMLDivElement | null,
  restartEl: null as HTMLButtonElement | null,

  /**
   * Register service worker change listeners and build the update banner.
   */
  register(): void {
    if (!('serviceWorker' in navigator)) return

    // Build the update banner HTML once
    this.buildBanner()

    // When the controller changes (new SW activated), show the banner
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      this.showBanner()
    })

    // Also check on page visibility change – the SW may have activated while
    // the tab was in the background and the controllerchange event was missed.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return
      const controller = navigator.serviceWorker.controller
      // If there is a controller, a new SW may have taken over
      if (controller) {
        // We always re-check so that the banner appears even if the user
        // left the page open before the update arrived.
        const manifest = import.meta.env.BASE_URL + 'manifest.webmanifest'
        fetch(manifest, { cache: 'no-cache' })
          .then((r) => r.json())
          .then((manifestData: { version: string }) => {
            // Compare the manifest version with the one embedded at build time.
            // If they differ, the current page is stale – show the banner.
            if (manifestData.version !== __APP_VERSION__) {
              this.showBanner()
            }
          })
          .catch(() => {
            // Manifest fetch failed – fall back to the controllerchange event
          })
      }
    })
  },

  /**
   * Create the update banner element and inject it into the DOM.
   */
  buildBanner(): void {
    const div = document.createElement('div')
    div.id = 'update-banner'
    div.innerHTML = `
      <h2></h2>
      <button type="button"></button>
    `
    div.style.display = 'none'
    document.body.appendChild(div)
    this.bannerEl = div
    const h2 = div.querySelector('h2') as HTMLHeadingElement
    const btn = div.querySelector('button') as HTMLButtonElement
    h2.textContent = t('updateAvailable')
    btn.textContent = t('updateRestart')

    // Click handler: hard-reload to pick up the new service worker
    btn.addEventListener('click', () => {
      window.location.reload()
    })

    // Make the banner dismissible – tapping anywhere outside the button hides it
    div.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.target === div) {
        div.style.display = 'none'
      }
    })
  },

  /**
   * Show the update banner, hiding the start overlay if visible.
   */
  showBanner(): void {
    if (!this.bannerEl) return
    // Don't show if the update banner is already visible
    if (this.bannerEl.style.display === 'flex') return
    const startOverlay = document.getElementById('start-overlay')
    if (startOverlay) startOverlay.style.display = 'none'
    this.bannerEl.style.display = 'flex'
  },
}
