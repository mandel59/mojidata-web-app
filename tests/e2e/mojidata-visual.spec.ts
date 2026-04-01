import type { Page } from '@playwright/test'
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

async function expectStableScreenshot(page: Page, name: string) {
  await expect(page).toHaveScreenshot(name, {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.001,
  })
}

test('desktop mojidata top view matches baseline', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: DESKTOP_UA,
    viewport: { width: 1440, height: 1200 },
  })
  const page = await context.newPage()

  await gotoVisual(page, '/ja-JP/mojidata/%E6%BC%A2')
  await expect(page.locator('.mojidata-summary-wrap')).toBeVisible()
  await expectStableScreenshot(page, 'desktop-mojidata-top.png')

  await context.close()
})

test('desktop mojidata moji_joho matches baseline', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: DESKTOP_UA,
    viewport: { width: 1440, height: 1200 },
  })
  const page = await context.newPage()

  await gotoVisual(page, '/ja-JP/mojidata/%E6%BC%A2?mojiJohoImage=1')
  await page.locator('#Moji_Joho').scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await expectStableScreenshot(page, 'desktop-mojidata-mojijoho.png')

  await context.close()
})

test('mobile mojidata top view matches baseline', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: MOBILE_UA,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()

  await gotoVisual(page, '/ja-JP/mojidata/%E6%BC%A2')
  await expect(page.locator('.mojidata-summary-wrap')).toBeVisible()
  await expectStableScreenshot(page, 'mobile-mojidata-top.png')

  await context.close()
})

test('mobile mojidata variants view matches baseline', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: MOBILE_UA,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()

  await gotoVisual(page, '/ja-JP/mojidata/%E6%B0%B4')
  await page.locator('#Variants').scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await expectStableScreenshot(page, 'mobile-mojidata-variants.png')

  await context.close()
})
