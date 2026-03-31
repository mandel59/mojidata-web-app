import type { BrowserContext } from '@playwright/test'
import { attachBrowserErrorChecks, expect, test } from './fixtures'

async function newCheckedPage(context: BrowserContext) {
  const page = await context.newPage()
  const assertNoBrowserErrors = attachBrowserErrorChecks(page)
  return { page, assertNoBrowserErrors }
}

test('mojidata page renders', async ({ page }) => {
  const res = await page.goto('/ja-JP/mojidata/%E6%BC%A2')
  expect(res?.status()).toBe(200)
  await expect(
    page.getByRole('heading', { level: 2, name: /文字データ|Character Data/ }),
  ).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/mojidata\/%E6%BC%A2$/,
  )
})

const DESKTOP_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

test.describe('direct open with fragment scrolls to target heading', () => {
  test('desktop UA + viewport', async ({ browser }) => {
    const context = await browser.newContext({
      userAgent: DESKTOP_UA,
      viewport: { width: 1280, height: 900 },
    })
    const { page, assertNoBrowserErrors } = await newCheckedPage(context)
    await page.goto('/ja-JP/mojidata/%F0%AB%97%82#External_Links', {
      waitUntil: 'domcontentloaded',
    })

    const target = page.locator('#External_Links')
    await expect(target).toBeVisible({ timeout: 60_000 })

    await expect
      .poll(async () =>
        target.evaluate((el) => Math.abs(el.getBoundingClientRect().top)),
      )
      .toBeLessThan(220)

    assertNoBrowserErrors()
    await context.close()
  })

  test('mobile UA + viewport', async ({ browser }) => {
    const context = await browser.newContext({
      userAgent: MOBILE_UA,
      viewport: { width: 390, height: 844 },
    })
    const { page, assertNoBrowserErrors } = await newCheckedPage(context)
    await page.goto('/ja-JP/mojidata/%F0%AB%97%82#External_Links', {
      waitUntil: 'domcontentloaded',
    })

    const target = page.locator('#External_Links')
    await expect(target).toBeVisible({ timeout: 60_000 })

    await expect
      .poll(async () =>
        target.evaluate((el) => Math.abs(el.getBoundingClientRect().top)),
      )
      .toBeLessThan(260)

    assertNoBrowserErrors()
    await context.close()
  })
})

test('mobile non-SPA mojidata page exposes permalink as link', async ({
  browser,
}) => {
  const context = await browser.newContext({
    userAgent: MOBILE_UA,
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: false,
  })
  const { page, assertNoBrowserErrors } = await newCheckedPage(context)

  await page.goto('/ja-JP/mojidata/%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })

  await expect(
    page.getByRole('link', { name: /固定リンクをコピー|Copy permalink/ }),
  ).toHaveCount(1)
  await expect(
    page.getByRole('button', { name: /固定リンクをコピー|Copy permalink/ }),
  ).toHaveCount(0)

  assertNoBrowserErrors()
  await context.close()
})

test('moji_joho display mode toggles without route refetch', async ({ page }) => {
  await page.goto('/ja-JP/mojidata/%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })

  await expect(
    page.getByRole('heading', { level: 3, name: /Moji_Joho/ }),
  ).toBeVisible()

  const routeRefetches: string[] = []
  page.on('request', (request) => {
    const url = request.url()
    if (
      url.includes('_rsc=') ||
      url.includes('/ja-JP/mojidata/%E6%BC%A2?mojiJohoImage=1')
    ) {
      routeRefetches.push(url)
    }
  })

  await page.getByRole('button', { name: /画像|Image/ }).click()

  await expect
    .poll(() => page.url())
    .toContain('/ja-JP/mojidata/%E6%BC%A2?mojiJohoImage=1')
  await expect(page.locator('img[src^="/api/ipamjm/svg/"]').first()).toBeVisible()
  await page.waitForTimeout(300)
  expect(routeRefetches).toEqual([])
})

test('mojidata server-data can show perf debug panel', async ({ page }) => {
  await page.goto('/ja-JP/mojidata/%E6%BC%A2?executionMode=server-data&perf=1', {
    waitUntil: 'domcontentloaded',
  })

  await expect(
    page.getByText(/Performance \(server-data\)/),
  ).toBeVisible()
  await expect(page.getByText(/total data load/)).toBeVisible()
})
