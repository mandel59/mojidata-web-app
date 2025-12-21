import { expect, test } from '@playwright/test'

test('mojidata page renders', async ({ page }) => {
  const res = await page.goto('/ja-JP/mojidata/%E6%BC%A2')
  expect(res?.status()).toBe(200)
  await expect(page.locator('h2#Character_Data')).toBeVisible()
})

