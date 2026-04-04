import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const storybookBaseUrl =
  process.env.STORYBOOK_BASE_URL ?? 'http://127.0.0.1:6006'

async function gotoStory(page: Page, id: string) {
  await page.goto(
    `${storybookBaseUrl}/iframe.html?id=${id}&viewMode=story`,
    { waitUntil: 'domcontentloaded' },
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
    'mojidata-deferredcharsvgimageview--glyph-wiki-fallback',
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
    'mojidata-deferredcharsvgimageview--glyph-wiki-loaded',
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
    'mojidata-deferredcharsvgimageview--ipamjm-fallback',
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
    'mojidata-deferredcharsvgimageview--ipamjm-loaded',
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
  await gotoStory(page, 'mojidata-mojidatasectionnav--mobile')

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
  await gotoStory(page, 'mojidata-mojidatasectionnav--desktop')

  await expect(page.getByTestId('mojidata-toc-sidebar')).toHaveScreenshot(
    'storybook-mojidata-section-nav-desktop.png',
    {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.001,
    },
  )
})
