import type { BrowserContext } from '@playwright/test'
import { attachBrowserErrorChecks, expect, test } from './fixtures'

// See ARCHITECTURE.md:
// canonical routes are stable, while execution mode can change by UA.
// This file verifies the UA-based delivery policy on canonical routes.

const BOT_UA =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

const LIKELY_BOT_UA =
  'Mozilla/5.0 (compatible; ExampleCrawler/1.0; +https://example.com/crawler)'

const BINGBOT_UA =
  'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'

const GOOGLE_INSPECTION_TOOL_UA =
  'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Mobile Safari/537.36 (compatible; Google-InspectionTool/1.0; +http://www.google.com/bot.html)'

const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

async function newCheckedPage(context: BrowserContext) {
  const page = await context.newPage()
  const assertNoBrowserErrors = attachBrowserErrorChecks(page)
  return { page, assertNoBrowserErrors }
}

test('googlebot stays server-data on canonical search', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: BOT_UA,
    javaScriptEnabled: false,
  })
  const { page, assertNoBrowserErrors } = await newCheckedPage(context)

  await page.goto('/ja-JP/search?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.locator('[data-spa="search"]')).toHaveCount(0)
  await expect(page.getByText('This page requires JavaScript.')).toHaveCount(0)

  assertNoBrowserErrors()
  await context.close()
})

test('google-inspectiontool stays server-data on canonical search', async ({
  browser,
}) => {
  const context = await browser.newContext({
    userAgent: GOOGLE_INSPECTION_TOOL_UA,
    javaScriptEnabled: false,
  })
  const { page, assertNoBrowserErrors } = await newCheckedPage(context)

  await page.goto('/ja-JP/search?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.locator('[data-spa="search"]')).toHaveCount(0)
  await expect(page.getByText('This page requires JavaScript.')).toHaveCount(0)

  assertNoBrowserErrors()
  await context.close()
})

test('bingbot stays server-data on canonical search', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: BINGBOT_UA,
    javaScriptEnabled: false,
  })
  const { page, assertNoBrowserErrors } = await newCheckedPage(context)

  await page.goto('/ja-JP/search?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.locator('[data-spa="search"]')).toHaveCount(0)
  await expect(page.getByText('This page requires JavaScript.')).toHaveCount(0)

  assertNoBrowserErrors()
  await context.close()
})

test('mobile non-SPA search page can use search examples', async ({
  browser,
}) => {
  const context = await browser.newContext({
    userAgent: MOBILE_UA,
    viewport: { width: 390, height: 844 },
  })
  const { page, assertNoBrowserErrors } = await newCheckedPage(context)

  await page.goto('/ja-JP/search', {
    waitUntil: 'domcontentloaded',
  })

  await page.getByRole('link', { name: '⿰日月' }).click()

  await expect(page).toHaveURL(/\/ja-JP\/search\?query=/)
  await expect(page.locator('#mojidata-query-input').first()).toHaveValue('⿰日月')

  assertNoBrowserErrors()
  await context.close()
})

test('mobile non-SPA search results page keeps form usable', async ({
  browser,
}) => {
  const context = await browser.newContext({
    userAgent: MOBILE_UA,
    viewport: { width: 390, height: 844 },
  })
  const { page, assertNoBrowserErrors } = await newCheckedPage(context)

  await page.goto('/ja-JP/search?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })

  await page.getByText(/Mojidata Search|Mojidata 検索/).first().click()

  const input = page.locator('#mojidata-query-input').first()
  await expect(input).toBeVisible()
  await input.fill('⿰日月')
  await page.getByRole('button', { name: /Search|検索/ }).click()

  await expect(page).toHaveURL(/\/search\?query=/)
  await expect(input).toHaveValue('⿰日月')

  assertNoBrowserErrors()
  await context.close()
})

test('mobile non-SPA search keeps drawer trigger above results', async ({
  browser,
}) => {
  const context = await browser.newContext({
    userAgent: MOBILE_UA,
    viewport: { width: 390, height: 844 },
  })
  const { page, assertNoBrowserErrors } = await newCheckedPage(context)

  await page.goto('/ja-JP/search?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })

  const trigger = page.getByText(/Mojidata Search|Mojidata 検索/).first()
  const result = page.locator('article a[href*="/mojidata/"]:visible').first()

  await expect(page.locator('#mojidata-query-input:visible')).toHaveCount(0)
  await expect(trigger).toBeVisible()
  await expect(result).toBeVisible()

  const triggerBox = await trigger.boundingBox()
  const resultBox = await result.boundingBox()

  expect(triggerBox).not.toBeNull()
  expect(resultBox).not.toBeNull()
  expect(triggerBox?.y ?? 0).toBeLessThan(resultBox?.y ?? 0)

  assertNoBrowserErrors()
  await context.close()
})

test('mobile non-SPA idsfind page can use quick examples', async ({
  browser,
}) => {
  const context = await browser.newContext({
    userAgent: MOBILE_UA,
    viewport: { width: 390, height: 844 },
  })
  const { page, assertNoBrowserErrors } = await newCheckedPage(context)

  await page.goto('/ja-JP/idsfind', {
    waitUntil: 'domcontentloaded',
  })

  await page.getByRole('link', { name: 'IDS: ⿰日月' }).click()

  await expect(page).toHaveURL(/\/ja-JP\/idsfind\?ids=/)
  await expect(page.locator('input[name="ids"]').first()).toHaveValue('⿰日月')

  assertNoBrowserErrors()
  await context.close()
})

test('mobile non-SPA idsfind results page keeps form usable', async ({
  browser,
}) => {
  const context = await browser.newContext({
    userAgent: MOBILE_UA,
    viewport: { width: 390, height: 844 },
  })
  const { page, assertNoBrowserErrors } = await newCheckedPage(context)

  await page.goto('/ja-JP/idsfind?ids=%E6%97%A5', {
    waitUntil: 'domcontentloaded',
  })

  await page.getByText('IDS Finder').first().click()

  const queryInput = page.locator('#ids-finder-query-input').first()
  await expect(queryInput).toBeVisible()
  await queryInput.fill('：日')
  await page.getByRole('button', { name: /Search|検索/ }).click()

  await expect(page).toHaveURL(/\/idsfind.*query=/)
  await expect(queryInput).toHaveValue('：日')

  assertNoBrowserErrors()
  await context.close()
})

test('non-indexing bot gets client-data on canonical search', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: LIKELY_BOT_UA,
    javaScriptEnabled: false,
  })
  const { page, assertNoBrowserErrors } = await newCheckedPage(context)

  await page.goto('/ja-JP/search?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.locator('[data-spa="search"]')).toHaveCount(1)

  assertNoBrowserErrors()
  await context.close()
})

test('non-indexing bot gets client-data on canonical mojidata', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: LIKELY_BOT_UA,
    javaScriptEnabled: false,
  })
  const { page, assertNoBrowserErrors } = await newCheckedPage(context)

  await page.goto('/ja-JP/mojidata/%E6%BC%A2', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('[data-spa="mojidata"]')).toHaveCount(1)

  assertNoBrowserErrors()
  await context.close()
})

test('non-indexing bot gets client-data on canonical idsfind', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: LIKELY_BOT_UA,
    javaScriptEnabled: false,
  })
  const { page, assertNoBrowserErrors } = await newCheckedPage(context)

  await page.goto('/ja-JP/idsfind?whole=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.locator('[data-spa="idsfind"]')).toHaveCount(1)

  assertNoBrowserErrors()
  await context.close()
})
