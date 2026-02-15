import { expect, test } from '@playwright/test'

test('idsfind page renders', async ({ page }) => {
  const res = await page.goto('/ja-JP/idsfind?whole=%E6%BC%A2')
  expect(res?.status()).toBe(200)
  await expect(page.locator('.ids-find-response')).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/idsfind\?whole=%E6%BC%A2/,
  )
  await expect(page.locator('.ids-find-result-char a').first()).toHaveAttribute(
    'href',
    /\/mojidata\//,
  )
})

test('search accepts formal syntax with eq operator', async ({ page }) => {
  const res = await page.goto('/ja-JP/search?query=totalStrokes%3D5')
  expect(res?.status()).toBe(200)
  await expect(page.locator('.ids-find-response')).toBeVisible()
  await expect(page.locator('.ids-find-result-char a').first()).toBeVisible()
})

test('search accepts formal syntax with comparison operator', async ({ page }) => {
  const res = await page.goto('/ja-JP/search?query=totalStrokes%3C%3D5')
  expect(res?.status()).toBe(200)
  await expect(page.locator('.ids-find-response')).toBeVisible()
  await expect(page.locator('.ids-find-result-char a').first()).toBeVisible()
})

test('unknown token with ~ keeps IDS fallback (no 500)', async ({ page }) => {
  const res = await page.goto('/ja-JP/search?query=foo~*')
  expect(res?.status()).toBe(200)
  await expect(page.getByText('No results found.')).toBeVisible()
  await expect(page.getByText('Fetch failed: 500')).toHaveCount(0)
})
