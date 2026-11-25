import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig(({ mode }) => {
  const isGithubPages = mode === 'github-pages'
  const base = isGithubPages ? '/sky_jitter/' : '/'
  return {
    base,
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifest: {
          name: 'Sky Jitter',
          short_name: 'Sky Jitter',
          description: 'Arcade space shooter - dodge enemies, fire weapons, survive 50 levels.',
          icons: [
            {
              src: `${base}favicon.svg`,
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
            {
              src: `${base}icons/apple-touch-icon.png`,
              sizes: '180x180',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${base}icons/maskable-512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: `${base}icons/icon-512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
          ],
          start_url: `${base}`,
          display: 'standalone',
          orientation: 'landscape',
          theme_color: '#000000',
          background_color: '#000000',
          categories: ['games'],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff2}'],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
  }
})
