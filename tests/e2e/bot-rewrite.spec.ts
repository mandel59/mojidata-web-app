import { expect, test } from '@playwright/test'

const BOT_UA =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

test('bot is rewritten to /search-spa', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: BOT_UA,
    javaScriptEnabled: false,
  })
  const page = await context.newPage()

  await page.goto('/ja-JP/search?query=%E6%BC%A2', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('article[data-spa="search"]')).toHaveCount(1)

  await context.close()
})

test('bot is rewritten to /mojidata-spa/[char]', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: BOT_UA,
    javaScriptEnabled: false,
  })
  const page = await context.newPage()

  await page.goto('/ja-JP/mojidata/%E6%BC%A2', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('article[data-spa="mojidata"]')).toHaveCount(1)

  await context.close()
})
