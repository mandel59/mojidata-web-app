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

async function expectStableLocatorScreenshot(
  locator: Locator,
  name: string,
  maxDiffPixelRatio = 0.001,
) {
  await expect(locator).toHaveScreenshot(name, {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio,
  })
}

test('desktop header matches baseline', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: DESKTOP_UA,
    viewport: { width: 1440, height: 1200 },
  })
  const page = await context.newPage()

  await gotoVisual(page, '/ja-JP/about')
  await expectStableLocatorScreenshot(
    page.locator('header').first(),
    'desktop-header.png',
    0.02,
  )

  await context.close()
})

test('mobile header matches baseline', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: MOBILE_UA,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()

  await gotoVisual(page, '/ja-JP/about')
  await expectStableLocatorScreenshot(
    page.locator('header').first(),
    'mobile-header.png',
    0.02,
  )

  await context.close()
})

test('desktop about article matches baseline', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: DESKTOP_UA,
    viewport: { width: 1440, height: 1200 },
  })
  const page = await context.newPage()

  await gotoVisual(page, '/ja-JP/about')
  await expectStableLocatorScreenshot(
    page.locator('main article').first(),
    'desktop-about-article.png',
    0.03,
  )

  await context.close()
})

test('mobile about article matches baseline', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: MOBILE_UA,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()

  await gotoVisual(page, '/ja-JP/about')
  await expectStableLocatorScreenshot(
    page.locator('main article').first(),
    'mobile-about-article.png',
    0.03,
  )

  await context.close()
})
