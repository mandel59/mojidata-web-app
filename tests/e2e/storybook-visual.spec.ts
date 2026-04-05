import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const storybookBaseUrl =
  process.env.STORYBOOK_BASE_URL ?? 'http://127.0.0.1:6006'

async function gotoStory(page: Page, id: string) {
  await page.goto(
    `${storybookBaseUrl}/iframe.html?id=${id}&viewMode=story`,
    { waitUntil: 'domcontentloaded' },
  )
  await page.waitForSelector('#storybook-root, #root')
  await page.waitForFunction(
    () => !document.body.classList.contains('sb-show-preparing-story'),
  )
  await page.evaluate(async () => {
    if ('fonts' in document) {
      await document.fonts.ready
    }
  })
  await page.waitForTimeout(150)
}

test('storybook glyph wiki fallback matches baseline', async ({ page }) => {
  await gotoStory(
    page,
    'mojidata-pure-views-deferredcharsvgimageview--glyph-wiki-fallback',
  )

  await expect(page.getByTestId('deferred-char-image')).toHaveScreenshot(
    'storybook-glyphwiki-fallback.png',
    {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
    },
  )
})

test('storybook glyph wiki loaded matches baseline', async ({ page }) => {
  await gotoStory(
    page,
    'mojidata-pure-views-deferredcharsvgimageview--glyph-wiki-loaded',
  )

  await expect(page.getByTestId('deferred-char-image')).toHaveScreenshot(
    'storybook-glyphwiki-loaded.png',
    {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
    },
  )
})

test('storybook ipamjm fallback matches baseline', async ({ page }) => {
  await gotoStory(
    page,
    'mojidata-pure-views-deferredcharsvgimageview--ipamjm-fallback',
  )

  await expect(page.getByTestId('deferred-char-image')).toHaveScreenshot(
    'storybook-ipamjm-fallback.png',
    {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
    },
  )
})

test('storybook ipamjm loaded matches baseline', async ({ page }) => {
  await gotoStory(
    page,
    'mojidata-pure-views-deferredcharsvgimageview--ipamjm-loaded',
  )

  await expect(page.getByTestId('deferred-char-image')).toHaveScreenshot(
    'storybook-ipamjm-loaded.png',
    {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
    },
  )
})

test('storybook mojidata section nav mobile matches baseline', async ({
  page,
}) => {
  await page.setViewportSize({ width: 430, height: 960 })
  await gotoStory(page, 'mojidata-pure-views-mojidatasectionnavview--mobile')

  await expect(page.getByTestId('mojidata-section-nav-mobile')).toHaveScreenshot(
    'storybook-mojidata-section-nav-mobile.png',
    {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
    },
  )
})

test('storybook mojidata section nav desktop matches baseline', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1200 })
  await gotoStory(page, 'mojidata-pure-views-mojidatasectionnavview--desktop')

  await expect(page.getByTestId('mojidata-toc-sidebar')).toHaveScreenshot(
    'storybook-mojidata-section-nav-desktop.png',
    {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
    },
  )
})

test('storybook loading article matches baseline', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 })
  await gotoStory(page, 'app-pure-views-loading-states--search-results-panel')

  await expect(page.getByTestId('loading-article')).toHaveScreenshot(
    'storybook-loading-article.png',
    {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
    },
  )
})

test('storybook loading mojidata article matches baseline', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 1000 })
  await gotoStory(page, 'app-pure-views-loading-states--mojidata-article')

  await expect(page.getByTestId('loading-mojidata-article')).toHaveScreenshot(
    'storybook-loading-mojidata-article.png',
    {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
    },
  )
})

test('storybook deferred variants collapsed matches baseline', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 1000 })
  await gotoStory(
    page,
    'mojidata-pure-views-mojidatadeferredvariantsview--collapsed',
  )

  await expect(page.getByTestId('mojidata-deferred-variants-view')).toHaveScreenshot(
    'storybook-mojidata-deferred-variants-collapsed.png',
    {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
    },
  )
})

test('storybook deferred variants expanded matches baseline', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 1000 })
  await gotoStory(
    page,
    'mojidata-pure-views-mojidatadeferredvariantsview--expanded',
  )

  await expect(page.getByTestId('mojidata-deferred-variants-view')).toHaveScreenshot(
    'storybook-mojidata-deferred-variants-expanded.png',
    {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
    },
  )
})

test('storybook moji_joho display control auto matches baseline', async ({
  page,
}) => {
  await gotoStory(
    page,
    'mojidata-pure-views-mojijohodisplaymodecontrolview--auto-selected',
  )

  await expect(
    page.getByTestId('moji-joho-display-mode-control'),
  ).toBeVisible()
  await expect(
    page.getByTestId('moji-joho-display-mode-control'),
  ).toHaveScreenshot('storybook-moji-joho-display-control-auto.png', {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.001,
  })
})

test('storybook moji_joho display control image matches baseline', async ({
  page,
}) => {
  await gotoStory(
    page,
    'mojidata-pure-views-mojijohodisplaymodecontrolview--image-selected',
  )

  await expect(
    page.getByTestId('moji-joho-display-mode-control'),
  ).toBeVisible()
  await expect(
    page.getByTestId('moji-joho-display-mode-control'),
  ).toHaveScreenshot('storybook-moji-joho-display-control-image.png', {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.001,
  })
})

test('storybook mojidata page composition desktop matches baseline', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1200 })
  await gotoStory(page, 'app-layout-compositions-mojidatapage--desktop')

  await expect(page.getByTestId('mojidata-layout-composition')).toHaveScreenshot(
    'storybook-mojidata-layout-composition-desktop.png',
    {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
    },
  )
})

test('storybook mojidata page composition mobile matches baseline', async ({
  page,
}) => {
  await page.setViewportSize({ width: 430, height: 960 })
  await gotoStory(page, 'app-layout-compositions-mojidatapage--mobile')

  await expect(page.getByTestId('mojidata-layout-composition')).toHaveScreenshot(
    'storybook-mojidata-layout-composition-mobile.png',
    {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
    },
  )
})

test('storybook search page composition desktop matches baseline', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1200 })
  await gotoStory(page, 'app-layout-compositions-searchresultspage--desktop')

  await expect(page.getByTestId('search-layout-page-composition')).toHaveScreenshot(
    'storybook-search-layout-composition-desktop.png',
    {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
    },
  )
})

test('storybook search page composition mobile matches baseline', async ({
  page,
}) => {
  await page.setViewportSize({ width: 430, height: 960 })
  await gotoStory(page, 'app-layout-compositions-searchresultspage--mobile')

  await expect(page.getByTestId('search-layout-page-composition')).toHaveScreenshot(
    'storybook-search-layout-composition-mobile.png',
    {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
    },
  )
})

test('storybook search glyph image matches baseline', async ({ page }) => {
  await gotoStory(page, 'search-pure-views-glyphwikicharimg--default')

  await expect(page.getByRole('img', { name: '漢' })).toHaveScreenshot(
    'storybook-search-glyphwiki-char-img.png',
    {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
    },
  )
})

test('storybook idsfind results grid matches baseline', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 960 })
  await gotoStory(page, 'search-interactive-idsfindresponseview--results-grid')

  await expect(page.locator('article')).toHaveScreenshot(
    'storybook-idsfind-response-view-results-grid.png',
    {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
    },
  )
})
