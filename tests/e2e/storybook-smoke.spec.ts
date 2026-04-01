import { expect, test } from '@playwright/test'

test('storybook deferred SVG fallback story renders', async ({ page }) => {
  await page.goto(
    'http://127.0.0.1:6006/iframe.html?id=mojidata-deferredcharsvgimageview--glyph-wiki-fallback&viewMode=story',
    { waitUntil: 'domcontentloaded' },
  )

  const glyph = page.locator('.mojidata-deferred-char-image')
  await expect(glyph).toBeVisible()
  await expect(glyph.locator('.mojidata-deferred-char-image__fallback')).toHaveText(
    '漢',
  )
})

test('storybook deferred SVG loaded story renders image', async ({ page }) => {
  await page.goto(
    'http://127.0.0.1:6006/iframe.html?id=mojidata-deferredcharsvgimageview--glyph-wiki-loaded&viewMode=story',
    { waitUntil: 'domcontentloaded' },
  )

  const glyph = page.locator('.mojidata-deferred-char-image')
  await expect(glyph).toHaveAttribute('data-loaded', 'true')
  await expect(glyph.locator('.mojidata-deferred-char-image__img')).toBeVisible()
})
