import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'

const VISUAL_TARGET_URL =
  process.env.VISUAL_TARGET_URL ?? 'http://127.0.0.1:3000'

const DESKTOP_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

async function gotoVisual(page: Page, path: string) {
  await page.goto(new URL(path, VISUAL_TARGET_URL).href, {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForLoadState('networkidle')
  await page.evaluate(async () => {
    if ('fonts' in document) {
      await document.fonts.ready
    }
  })
  await page.waitForTimeout(300)
}

async function waitForVisibleImages(page: Page) {
  await page.waitForFunction(() => {
    const images = Array.from(document.images).filter((image) => {
      const rect = image.getBoundingClientRect()
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight
      )
    })
    return images.every((image) => image.complete && image.naturalWidth > 0)
  })
}

async function expectStableLocatorScreenshot(
  page: Page,
  locator: Locator,
  name: string,
  maxDiffPixelRatio = 0.001,
) {
  await waitForVisibleImages(page)
  await expect(locator).toHaveScreenshot(name, {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio,
  })
}

test('desktop search results match baseline', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: DESKTOP_UA,
    viewport: { width: 1440, height: 1200 },
  })
  const page = await context.newPage()

  await gotoVisual(page, '/ja-JP/search?query=%E6%BC%A2')
  await page.waitForSelector('main article')
  await expectStableLocatorScreenshot(
    page,
    page.locator('form [data-slot="card"]').first(),
    'desktop-search-form.png',
    0.03,
  )
  await expectStableLocatorScreenshot(
    page,
    page.locator('main article'),
    'desktop-search-results.png',
    0.08,
  )

  await context.close()
})

test('mobile search results match baseline', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: MOBILE_UA,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()

  await gotoVisual(page, '/ja-JP/search?query=%E6%BC%A2')
  await page.waitForSelector('main article')
  await expectStableLocatorScreenshot(
    page,
    page.locator('main button').first(),
    'mobile-search-trigger.png',
    0.03,
  )
  await expectStableLocatorScreenshot(
    page,
    page.locator('main article'),
    'mobile-search-results.png',
    0.08,
  )

  await context.close()
})

test('desktop idsfind results match baseline', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: DESKTOP_UA,
    viewport: { width: 1440, height: 1200 },
  })
  const page = await context.newPage()

  await gotoVisual(page, '/ja-JP/idsfind?whole=%E2%BF%B0%EF%BC%9F%E6%9C%88')
  await page.waitForSelector('main article')
  await expectStableLocatorScreenshot(
    page,
    page.locator('form [data-slot="card"]').first(),
    'desktop-idsfind-form.png',
    0.03,
  )
  await expectStableLocatorScreenshot(
    page,
    page.locator('main article'),
    'desktop-idsfind-results.png',
    0.08,
  )

  await context.close()
})

test('mobile idsfind results match baseline', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: MOBILE_UA,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()

  await gotoVisual(page, '/ja-JP/idsfind?whole=%E2%BF%B0%EF%BC%9F%E6%9C%88')
  await page.waitForSelector('main article')
  await expectStableLocatorScreenshot(
    page,
    page.locator('main button').first(),
    'mobile-idsfind-trigger.png',
    0.03,
  )
  await expectStableLocatorScreenshot(
    page,
    page.locator('main article'),
    'mobile-idsfind-results.png',
    0.08,
  )

  await context.close()
})
