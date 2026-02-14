import { expect, test } from '@playwright/test'

const BOT_UA =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

async function makePageScrollable(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const spacer = document.createElement('div')
    spacer.id = 'test-scroll-spacer'
    spacer.style.height = '3000px'
    document.body.appendChild(spacer)
    window.scrollTo({ top: 1200, left: 0 })
  })
  await expect
    .poll(async () => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(300)
}

test('non-SPA (bot route) navigation resets scroll position on link click', async ({
  browser,
}) => {
  const context = await browser.newContext({ userAgent: BOT_UA })
  const page = await context.newPage()

  await page.goto('/ja-JP/search?query=%E6%BC%A2', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.ids-find-result-char a').first()).toBeVisible({
    timeout: 60_000,
  })
  await expect(page.locator('.ids-find-result-char a').first()).toHaveAttribute(
    'href',
    /\/mojidata\//,
  )

  await makePageScrollable(page)

  await page.locator('.ids-find-result-char a').first().click()
  await page.waitForURL(/\/mojidata\//)
  await expect(
    page.getByRole('heading', { level: 2, name: /文字データ|Character Data/ }),
  ).toBeVisible({ timeout: 60_000 })
  await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeLessThan(20)

  await context.close()
})

test('SPA navigation resets scroll position on link click', async ({ page }) => {
  await page.goto('/ja-JP/search-spa?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.locator('.ids-find-result-char a').first()).toBeVisible({
    timeout: 60_000,
  })
  await expect(page.locator('.ids-find-result-char a').first()).toHaveAttribute(
    'href',
    /\/mojidata\//,
  )

  await makePageScrollable(page)

  await page.locator('.ids-find-result-char a').first().click()
  await page.waitForURL(/\/mojidata\//)
  await expect(page.locator('.mojidata-response')).toHaveCount(1, {
    timeout: 60_000,
  })
  await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeLessThan(20)
})
