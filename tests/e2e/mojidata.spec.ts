import { expect, test } from '@playwright/test'

test('mojidata page renders', async ({ page }) => {
  const res = await page.goto('/ja-JP/mojidata/%E6%BC%A2')
  expect(res?.status()).toBe(200)
  await expect(
    page.getByRole('heading', { level: 2, name: /文字データ|Character Data/ }),
  ).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/mojidata\/%E6%BC%A2$/,
  )
})
