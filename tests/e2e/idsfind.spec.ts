import { devices, expect, test, type Page } from '@playwright/test'

// ARCHITECTURE.md "Rewrite Policy (explicit)":
// canonical /search may be internally rewritten to /search-spa depending on UA/config.
// So this helper optionally enforces non-SPA markers only when the test intent is
// specifically "server/non-SPA behavior" (e.g. mobile UA path checks).

const MOBILE_UA = devices['iPhone 13']

async function expectSearchWorks(page: Page, query: string, requireNonSpa = false) {
  const res = await page.goto(`/ja-JP/search?query=${encodeURIComponent(query)}`)
  expect(res?.status()).toBe(200)
  if (requireNonSpa) {
    await expect(page.locator('[data-spa="search"]')).toHaveCount(0)
  }
  await expect(page.locator('article')).toBeVisible()
  await expect(page.locator('article a[href*="/mojidata/"]').first()).toBeVisible()
  await expect(page.getByText('Fetch failed: 500')).toHaveCount(0)
}

test('idsfind page renders', async ({ page }) => {
  const res = await page.goto('/ja-JP/idsfind?whole=%E6%BC%A2')
  expect(res?.status()).toBe(200)
  await expect(page.locator('article')).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/idsfind\?whole=(%E6%BC%A2|漢)/,
  )
  await expect(page.locator('article a[href*="/mojidata/"]').first()).toHaveAttribute(
    'href',
    /\/mojidata\//,
  )
})

test('search accepts formal syntax with eq operator', async ({ page }) => {
  await expectSearchWorks(page, 'totalStrokes=5')
})

test('search accepts formal syntax with comparison operator', async ({ page }) => {
  await expectSearchWorks(page, 'totalStrokes<=5')
})

test('search accepts unihan variant formal syntax', async ({ page }) => {
  await expectSearchWorks(page, 'unihan.kTraditionalVariant=線')
})

test('unknown token with ~ keeps IDS fallback (no 500)', async ({ page }) => {
  const res = await page.goto('/ja-JP/search?query=foo~*')
  expect(res?.status()).toBe(200)
  await expect(page.getByText('No results found.')).toBeVisible()
  await expect(page.getByText('Fetch failed: 500')).toHaveCount(0)
})

test.describe('mobile UA (non-SPA search)', () => {
  test('search accepts formal syntax with eq operator on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      userAgent: MOBILE_UA.userAgent,
      viewport: MOBILE_UA.viewport,
      deviceScaleFactor: MOBILE_UA.deviceScaleFactor,
      isMobile: MOBILE_UA.isMobile,
      hasTouch: MOBILE_UA.hasTouch,
    })
    const page = await context.newPage()
    await expectSearchWorks(page, 'totalStrokes=5', true)
    await context.close()
  })

  test('search accepts formal syntax with comparison operator on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      userAgent: MOBILE_UA.userAgent,
      viewport: MOBILE_UA.viewport,
      deviceScaleFactor: MOBILE_UA.deviceScaleFactor,
      isMobile: MOBILE_UA.isMobile,
      hasTouch: MOBILE_UA.hasTouch,
    })
    const page = await context.newPage()
    await expectSearchWorks(page, 'totalStrokes<=5', true)
    await context.close()
  })

  test('search accepts unihan variant formal syntax on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      userAgent: MOBILE_UA.userAgent,
      viewport: MOBILE_UA.viewport,
      deviceScaleFactor: MOBILE_UA.deviceScaleFactor,
      isMobile: MOBILE_UA.isMobile,
      hasTouch: MOBILE_UA.hasTouch,
    })
    const page = await context.newPage()
    await expectSearchWorks(page, 'unihan.kTraditionalVariant=線', true)
    await context.close()
  })
})
