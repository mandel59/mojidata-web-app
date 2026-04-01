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

test('desktop mojidata keeps the TOC sidebar beside the main content', async ({
  browser,
}) => {
  const context = await browser.newContext({
    userAgent: DESKTOP_UA,
    viewport: { width: 1280, height: 900 },
  })
  const { page, assertNoBrowserErrors } = await newCheckedPage(context)

  await page.goto('/ja-JP/mojidata/%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })

  const sidebar = page.locator('.mojidata-toc-sidebar')
  const main = page.locator('.mojidata-content-main')
  await expect(sidebar).toBeVisible()
  await expect(main).toBeVisible()

  const [sidebarBox, mainBox] = await Promise.all([
    sidebar.boundingBox(),
    main.boundingBox(),
  ])
  expect(sidebarBox).not.toBeNull()
  expect(mainBox).not.toBeNull()
  expect((sidebarBox?.x ?? 0) + (sidebarBox?.width ?? 0)).toBeLessThan(
    (mainBox?.x ?? 0),
  )

  assertNoBrowserErrors()
  await context.close()
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

test('mojidata json is loaded on demand', async ({ page }) => {
  await page.goto('/ja-JP/mojidata/%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })

  await expect(
    page.locator('pre').filter({ hasText: '"UCS"' }),
  ).toHaveCount(0)

  await page.getByRole('button', { name: /JSONを表示|Show JSON/ }).click()

  await expect(
    page.locator('pre').filter({ hasText: '"UCS"' }),
  ).toBeVisible()
})

test('server-data search-to-mojidata navigation shows immediate feedback', async ({
  browser,
}) => {
  const context = await browser.newContext({
    userAgent: MOBILE_UA,
    viewport: { width: 390, height: 844 },
  })
  const { page, assertNoBrowserErrors } = await newCheckedPage(context)

  let delayed = false
  await page.route('**/*_rsc=*', async (route) => {
    const url = route.request().url()
    if (!delayed && url.includes('/ja-JP/mojidata/')) {
      delayed = true
      await new Promise((resolve) => setTimeout(resolve, 1200))
    }
    await route.continue()
  })

  await page.goto('/ja-JP/search?query=%E6%97%A5', {
    waitUntil: 'domcontentloaded',
  })
  const firstResultLink = page.locator('.ids-find-result-link').first()
  await expect(firstResultLink).toBeVisible()

  await firstResultLink.click()

  await expect
    .poll(async () => {
      if (
        await page
          .locator('[data-navigation-pending="true"]')
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        return 'progress'
      }
      if (
        await page
          .getByText(/Loading character data…/)
          .isVisible()
          .catch(() => false)
      ) {
        return 'loading'
      }
      if (
        await page
          .getByRole('heading', { level: 2, name: /文字データ|Character Data/ })
          .isVisible()
          .catch(() => false)
      ) {
        return 'heading'
      }
      return 'none'
    }, {
      timeout: 1000,
    })
    .not.toBe('none')
  await expect(
    page.getByRole('heading', { level: 2, name: /文字データ|Character Data/ }),
  ).toBeVisible({ timeout: 60_000 })

  assertNoBrowserErrors()
  await context.close()
})

test('mojidata variants defer the extra glyphs until expanded', async ({
  page,
}) => {
  await page.goto('/ja-JP/mojidata/%E6%B0%B4', {
    waitUntil: 'domcontentloaded',
  })

  const variantCards = page.locator('.mojidata-variants-comparison > figure')
  await expect(variantCards).toHaveCount(6)

  const toggle = page.getByRole('button', { name: /残り \d+ 件を表示|Show remaining \d+/ })
  await expect(toggle).toBeVisible()
  await toggle.click()

  await expect(variantCards).not.toHaveCount(6)
  await expect(page.getByRole('button', { name: /折りたたむ|Show less/ })).toBeVisible()
})

test('search quick examples do not trigger the navigation progress bar', async ({
  page,
}) => {
  await page.goto('/ja-JP/search', {
    waitUntil: 'domcontentloaded',
  })

  const progressBar = page.locator('[data-navigation-pending="true"]')
  await page.getByRole('link', { name: '⿰日月' }).click()

  await expect(page.locator('input[name="query"]').first()).toHaveValue('⿰日月')
  await expect(progressBar).toHaveCount(0)
})

test('mojidata section links do not trigger the navigation progress bar', async ({
  page,
}) => {
  await page.goto('/ja-JP/mojidata/%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })

  const progressBar = page.locator('[data-navigation-pending="true"]')
  await page
    .locator('.mojidata-section-nav a[href="#Glyph_Comparison"]')
    .first()
    .click()

  await expect.poll(() => page.url()).toContain('#Glyph_Comparison')
  await expect(progressBar).toHaveCount(0)
})
