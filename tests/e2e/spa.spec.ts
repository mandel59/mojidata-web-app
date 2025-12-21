import { expect, test } from '@playwright/test'

test('search-spa renders results in browser', async ({ page }) => {
  page.on('pageerror', (err) => console.log('[pageerror]', err))
  page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()))

  await page.goto('/ja-JP/search-spa?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })

  await expect(page.locator('[data-spa="search"]')).toHaveCount(1)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/search\?query=/,
  )
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    /noindex/,
  )
  await expect(page.locator('.ids-find-result-char').first()).toBeVisible({
    timeout: 60_000,
  })
})

test('mojidata-spa renders character data in browser', async ({ page }) => {
  page.on('pageerror', (err) => console.log('[pageerror]', err))
  page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()))

  await page.goto('/ja-JP/mojidata-spa/%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })

  await expect(page.locator('[data-spa="mojidata"]')).toHaveCount(1)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/mojidata\/%E6%BC%A2$/,
  )
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    /noindex/,
  )
  await expect(page.locator('.mojidata-response')).toHaveCount(1, {
    timeout: 60_000,
  })
  await expect(
    page.locator('.mojidata-response figure').first().locator('figcaption'),
  ).toContainText('U+6F22', {
    timeout: 60_000,
  })
})
