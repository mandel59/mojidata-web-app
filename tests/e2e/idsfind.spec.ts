import { expect, test } from '@playwright/test'

test('idsfind page renders', async ({ page }) => {
  const res = await page.goto('/ja-JP/idsfind?whole=%E6%BC%A2')
  expect(res?.status()).toBe(200)
  await expect(page.locator('.ids-find-response')).toBeVisible()
})
