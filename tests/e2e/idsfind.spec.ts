import { devices, expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'

// ARCHITECTURE.md "Rewrite Policy (explicit)":
// canonical /search may be internally rewritten to /search-spa depending on UA/config.
// So this helper optionally enforces non-SPA markers only when the test intent is
// specifically "server/non-SPA behavior" (e.g. mobile UA path checks).

const MOBILE_UA = devices['iPhone 13']

const FORMAL_PROPERTY_SMOKE_CASES: Array<{ property: string; value: string }> = [
  { property: 'UCS', value: '6F22' },
  { property: 'totalStrokes', value: '5' },
  { property: 'mji.読み', value: 'カ' },
  { property: 'mji.読み.prefix', value: 'カ' },
  { property: 'mji.MJ文字図形名', value: 'MJ000001' },
  { property: 'mji.総画数', value: '5' },

  { property: 'unihan.kCompatibilityVariant', value: '線' },
  { property: 'unihan.kSemanticVariant', value: '線' },
  { property: 'unihan.kSimplifiedVariant', value: '線' },
  { property: 'unihan.kSpecializedSemanticVariant', value: '線' },
  { property: 'unihan.kSpoofingVariant', value: '線' },
  { property: 'unihan.kTraditionalVariant', value: '線' },
  { property: 'unihan.kZVariant', value: '線' },

  { property: 'unihan.kIRG_GSource', value: 'G0-0000' },
  { property: 'unihan.kIRG_HSource', value: 'H-0000' },
  { property: 'unihan.kIRG_JSource', value: 'J0-0000' },
  { property: 'unihan.kIRG_KPSource', value: 'KP0-0000' },
  { property: 'unihan.kIRG_KSource', value: 'K0-0000' },
  { property: 'unihan.kIRG_MSource', value: 'M-0000' },
  { property: 'unihan.kIRG_SSource', value: 'S-0000' },
  { property: 'unihan.kIRG_TSource', value: 'T1-0000' },
  { property: 'unihan.kIRG_UKSource', value: 'UK-0000' },
  { property: 'unihan.kIRG_USource', value: 'U+0000' },
  { property: 'unihan.kIRG_VSource', value: 'V0-0000' },

  { property: 'unihan.kAccountingNumeric', value: '1' },
  { property: 'unihan.kOtherNumeric', value: '1' },
  { property: 'unihan.kPrimaryNumeric', value: '1' },
  { property: 'unihan.kTayNumeric', value: '1' },
  { property: 'unihan.kVietnameseNumeric', value: '1' },
  { property: 'unihan.kZhuangNumeric', value: '1' },

  { property: 'unihan.kCantonese', value: 'kaat3' },
  { property: 'unihan.kHangul', value: '한' },
  { property: 'unihan.kHanyuPinlu', value: 'han4' },
  { property: 'unihan.kHanyuPinyin', value: 'han4' },
  { property: 'unihan.kJapanese', value: 'カン' },
  { property: 'unihan.kJapaneseKun', value: 'ひ' },
  { property: 'unihan.kJapaneseOn', value: 'カン' },
  { property: 'unihan.kKorean', value: 'han' },
  { property: 'unihan.kMandarin', value: 'han4' },
  { property: 'unihan.kSMSZD2003Readings', value: 'han4' },
  { property: 'unihan.kTang', value: 'xeng' },
  { property: 'unihan.kTGHZ2013', value: 'han4' },
  { property: 'unihan.kVietnamese', value: 'hán' },
  { property: 'unihan.kXHC1983', value: 'han4' },
  { property: 'unihan.kZhuang', value: 'hanz' },

  { property: 'unihan.kTotalStrokes', value: '5' },
  { property: 'unihan.kDefinition', value: 'water' },
  { property: 'unihan.kFanqie', value: 'foo' },
  { property: 'unihan.kIICore', value: 'A' },
  { property: 'unihan.kRSUnicode', value: '85.4' },

  { property: 'unihan.kStrange', value: 'カ' },
  { property: 'unihan.kStrange.A', value: 'カ' },
  { property: 'unihan.kStrange.B', value: 'カ' },
  { property: 'unihan.kStrange.C', value: 'カ' },
  { property: 'unihan.kStrange.H', value: 'カ' },
  { property: 'unihan.kStrange.I', value: 'カ' },
  { property: 'unihan.kStrange.K', value: 'カ' },
  { property: 'unihan.kStrange.M', value: 'カ' },
  { property: 'unihan.kStrange.O', value: 'カ' },
  { property: 'unihan.kStrange.R', value: 'カ' },
  { property: 'unihan.kStrange.S', value: 'カ' },
  { property: 'unihan.kStrange.U', value: 'カ' },
  { property: 'unihan.kStrange.Y', value: 'カ' },
]

async function expectSearchWorks(
  page: Page,
  query: string,
  requireNonSpa = false,
  requireResults = true,
) {
  const res = await page.goto(`/ja-JP/search?query=${encodeURIComponent(query)}`)
  expect(res?.status(), `status should be 200 for query: ${query}`).toBe(200)
  if (requireNonSpa) {
    await expect(page.locator('[data-spa="search"]')).toHaveCount(0)
  }
  if (requireResults) {
    await expect(page.locator('article')).toBeVisible()
    await expect(page.locator('article a[href*="/mojidata/"]').first()).toBeVisible()
  }
  await expect(page.getByText('Fetch failed: 500')).toHaveCount(0)
}

async function expectSearchAccepted(
  page: Page,
  query: string,
  requireNonSpa = false,
) {
  const res = await page.goto(`/ja-JP/search?query=${encodeURIComponent(query)}`)
  expect(res?.status(), `status should be 200 for query: ${query}`).toBe(200)
  if (requireNonSpa) {
    await expect(page.locator('[data-spa="search"]')).toHaveCount(0)
  }
}

async function createMobileContext(browser: Browser): Promise<BrowserContext> {
  return browser.newContext({
    userAgent: MOBILE_UA.userAgent,
    viewport: MOBILE_UA.viewport,
    deviceScaleFactor: MOBILE_UA.deviceScaleFactor,
    isMobile: MOBILE_UA.isMobile,
    hasTouch: MOBILE_UA.hasTouch,
  })
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

test('idsfind page renders as non-SPA on mobile', async ({ browser }) => {
  const context = await createMobileContext(browser)
  const page = await context.newPage()
  const res = await page.goto('/ja-JP/idsfind?whole=%E6%BC%A2')
  expect(res?.status()).toBe(200)
  await expect(page.locator('[data-spa="idsfind"]')).toHaveCount(0)
  await expect(page.locator('article')).toBeVisible()
  await expect(page.locator('article a[href*="/mojidata/"]').first()).toHaveAttribute(
    'href',
    /\/mojidata\//,
  )
  await context.close()
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

test('search accepts unihan kStrange formal syntax', async ({ page }) => {
  await expectSearchWorks(page, 'unihan.kStrange.K=カ')
})

test('unknown token with ~ keeps IDS fallback (no 500)', async ({ page }) => {
  const res = await page.goto('/ja-JP/search?query=foo~*')
  expect(res?.status()).toBe(200)
  await expect(page.getByText('No results found.')).toBeVisible()
  await expect(page.getByText('Fetch failed: 500')).toHaveCount(0)
})

test.describe('formal property coverage', () => {
  test('all supported formal properties are accepted on mobile non-SPA', async ({ browser }) => {
    test.setTimeout(8 * 60_000)

    const context = await createMobileContext(browser)
    const page = await context.newPage()

    for (const { property, value } of FORMAL_PROPERTY_SMOKE_CASES) {
      const query = `${property}=${value}`
      await test.step(`query: ${query}`, async () => {
        await expectSearchAccepted(page, query, true)
      })
    }

    await context.close()
  })
})

test.describe('mobile UA (non-SPA search)', () => {
  test('search accepts formal syntax with eq operator on mobile', async ({ browser }) => {
    const context = await createMobileContext(browser)
    const page = await context.newPage()
    await expectSearchWorks(page, 'totalStrokes=5', true)
    await context.close()
  })

  test('search accepts formal syntax with comparison operator on mobile', async ({ browser }) => {
    const context = await createMobileContext(browser)
    const page = await context.newPage()
    await expectSearchWorks(page, 'totalStrokes<=5', true)
    await context.close()
  })

  test('search accepts unihan variant formal syntax on mobile', async ({ browser }) => {
    const context = await createMobileContext(browser)
    const page = await context.newPage()
    await expectSearchWorks(page, 'unihan.kTraditionalVariant=線', true)
    await context.close()
  })

  test('search accepts unihan kStrange formal syntax on mobile', async ({ browser }) => {
    const context = await createMobileContext(browser)
    const page = await context.newPage()
    await expectSearchWorks(page, 'unihan.kStrange.K=カ', true)
    await context.close()
  })
})
