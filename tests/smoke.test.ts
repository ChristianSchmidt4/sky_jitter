import { test, expect } from '@playwright/test'
test.describe('Sky Jitter - Smoke Tests', () => {
  test('app loads and shows start screen', async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await expect(page.locator('#start-overlay')).toBeVisible()
    await expect(page.locator('#start-button')).toBeVisible()
    await expect(page.locator('#game-root')).toBeVisible()
  })
  test('clicking start button launches game', async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.click('#start-button')
    await expect(page.locator('#start-overlay')).not.toBeVisible()
    await expect(page.locator('canvas')).toBeVisible()
  })
})
