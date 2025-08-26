import { test, expect } from '@playwright/test'

test('loads home and shows controls', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('AI Studio Lite')).toBeVisible()
  await expect(page.getByLabel('Text prompt')).toBeVisible()
})
