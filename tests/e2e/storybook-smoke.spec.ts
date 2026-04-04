import { expect, test } from '@playwright/test'

const storybookBaseUrl =
  process.env.STORYBOOK_BASE_URL ?? 'http://127.0.0.1:6006'

test('storybook deferred SVG fallback story renders', async ({ page }) => {
  await page.goto(
    `${storybookBaseUrl}/iframe.html?id=mojidata-deferredcharsvgimageview--glyph-wiki-fallback&viewMode=story`,
    { waitUntil: 'domcontentloaded' },
  )

  const glyph = page.getByTestId('deferred-char-image')
  await expect(glyph).toBeVisible()
  await expect(glyph.getByTestId('deferred-char-fallback')).toHaveText(
    '漢',
  )
})

test('storybook deferred SVG loaded story renders image', async ({ page }) => {
  await page.goto(
    `${storybookBaseUrl}/iframe.html?id=mojidata-deferredcharsvgimageview--glyph-wiki-loaded&viewMode=story`,
    { waitUntil: 'domcontentloaded' },
  )

  const glyph = page.getByTestId('deferred-char-image')
  await expect(glyph).toHaveAttribute('data-loaded', 'true')
  await expect(glyph.getByTestId('deferred-char-image-img')).toBeVisible()
})
