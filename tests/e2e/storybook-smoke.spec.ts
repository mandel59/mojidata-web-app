import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const storybookBaseUrl =
  process.env.STORYBOOK_BASE_URL ?? 'http://127.0.0.1:6006'

async function gotoStory(page: Page, id: string) {
  await page.goto(
    `${storybookBaseUrl}/iframe.html?id=${id}&viewMode=story`,
    { waitUntil: 'domcontentloaded' },
  )
}

test('storybook deferred SVG fallback story renders', async ({ page }) => {
  await gotoStory(
    page,
    'mojidata-deferredcharsvgimageview--glyph-wiki-fallback',
  )

  const glyph = page.getByTestId('deferred-char-image')
  await expect(glyph).toBeVisible()
  await expect(glyph.getByTestId('deferred-char-fallback')).toHaveText(
    '漢',
  )
})

test('storybook deferred SVG loaded story renders image', async ({ page }) => {
  await gotoStory(
    page,
    'mojidata-deferredcharsvgimageview--glyph-wiki-loaded',
  )

  const glyph = page.getByTestId('deferred-char-image')
  await expect(glyph).toHaveAttribute('data-loaded', 'true')
  await expect(glyph.getByTestId('deferred-char-image-img')).toBeVisible()
})

test('storybook mojidata section nav mobile story renders', async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 960 })
  await gotoStory(page, 'mojidata-mojidatasectionnav--mobile')

  await expect(
    page.getByTestId('mojidata-section-nav-mobile'),
  ).toBeVisible()
  await expect(page.getByTestId('mojidata-toc-sidebar')).toBeHidden()
})

test('storybook mojidata section nav desktop story renders', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 })
  await gotoStory(page, 'mojidata-mojidatasectionnav--desktop')

  await expect(page.getByTestId('mojidata-toc-sidebar')).toBeVisible()
  await expect(
    page.getByTestId('mojidata-section-nav-sidebar'),
  ).toBeVisible()
})
