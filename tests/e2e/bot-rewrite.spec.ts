import { expect, test } from '@playwright/test'

const BOT_UA =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

const LIKELY_BOT_UA =
  'Mozilla/5.0 (compatible; ExampleCrawler/1.0; +https://example.com/crawler)'

const BINGBOT_UA =
  'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'

const GOOGLE_INSPECTION_TOOL_UA =
  'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Mobile Safari/537.36 (compatible; Google-InspectionTool/1.0; +http://www.google.com/bot.html)'

test('googlebot is not rewritten to /search-spa', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: BOT_UA,
    javaScriptEnabled: false,
  })
  const page = await context.newPage()

  await page.goto('/ja-JP/search?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.locator('[data-spa="search"]')).toHaveCount(0)
  await expect(page.getByText('This page requires JavaScript.')).toHaveCount(0)

  await context.close()
})

test('google-inspectiontool is not rewritten to /search-spa', async ({
  browser,
}) => {
  const context = await browser.newContext({
    userAgent: GOOGLE_INSPECTION_TOOL_UA,
    javaScriptEnabled: false,
  })
  const page = await context.newPage()

  await page.goto('/ja-JP/search?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.locator('[data-spa="search"]')).toHaveCount(0)
  await expect(page.getByText('This page requires JavaScript.')).toHaveCount(0)

  await context.close()
})

test('bingbot is not rewritten to /search-spa', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: BINGBOT_UA,
    javaScriptEnabled: false,
  })
  const page = await context.newPage()

  await page.goto('/ja-JP/search?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.locator('[data-spa="search"]')).toHaveCount(0)
  await expect(page.getByText('This page requires JavaScript.')).toHaveCount(0)

  await context.close()
})

test('non-indexing bot is rewritten to /search-spa', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: LIKELY_BOT_UA,
    javaScriptEnabled: false,
  })
  const page = await context.newPage()

  await page.goto('/ja-JP/search?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.locator('[data-spa="search"]')).toHaveCount(1)

  await context.close()
})

test('non-indexing bot is rewritten to /mojidata-spa/[char]', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: LIKELY_BOT_UA,
    javaScriptEnabled: false,
  })
  const page = await context.newPage()

  await page.goto('/ja-JP/mojidata/%E6%BC%A2', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('[data-spa="mojidata"]')).toHaveCount(1)

  await context.close()
})

test('non-indexing bot is rewritten to /idsfind-spa', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: LIKELY_BOT_UA,
    javaScriptEnabled: false,
  })
  const page = await context.newPage()

  await page.goto('/ja-JP/idsfind?whole=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.locator('[data-spa="idsfind"]')).toHaveCount(1)

  await context.close()
})
