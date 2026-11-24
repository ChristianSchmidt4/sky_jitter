import { defineConfig } from 'vite'
export default defineConfig(({ mode }) => {
  const isGithubPages = mode === 'github-pages'
  return {
    base: isGithubPages ? '/sky_jitter/' : '/',
  }
})
