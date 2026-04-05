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
}

test('storybook deferred SVG fallback story renders', async ({ page }) => {
  await gotoStory(
    page,
    'mojidata-pure-views-deferredcharsvgimageview--glyph-wiki-fallback',
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
    'mojidata-pure-views-deferredcharsvgimageview--glyph-wiki-loaded',
  )

  const glyph = page.getByTestId('deferred-char-image')
  await expect(glyph).toHaveAttribute('data-loaded', 'true')
  await expect(glyph.getByTestId('deferred-char-image-img')).toBeVisible()
  const imageColor = await glyph
    .getByTestId('deferred-char-image-img')
    .evaluate((element) => window.getComputedStyle(element).color)
  expect(imageColor).toMatch(/^rgba\(.+,\s0\.42\)$/)
  expect(imageColor).not.toBe('rgb(0, 0, 0)')
})

test('storybook glyph wiki image uses muted alt text styling', async ({
  page,
}) => {
  await gotoStory(
    page,
    'mojidata-pure-views-deferredcharsvgimageview--glyph-wiki-loaded',
  )

  const image = page.getByTestId('deferred-char-image-img')
  const fontSize = await image.evaluate(
    (element) => window.getComputedStyle(element).fontSize,
  )
  expect(fontSize).toBe('100px')
})

test('storybook ipamjm fallback keeps the IPAmj/notdef fallback stack', async ({
  page,
}) => {
  await gotoStory(
    page,
    'mojidata-pure-views-deferredcharsvgimageview--ipamjm-fallback',
  )

  const fallback = page.getByTestId('deferred-char-fallback')
  await expect(fallback).toBeVisible()
  const color = await fallback.evaluate(
    (element) => window.getComputedStyle(element).color,
  )
  expect(color).toMatch(/^rgba\(.+,\s0\.42\)$/)
  const opacity = await fallback.evaluate(
    (element) => window.getComputedStyle(element).opacity,
  )
  expect(opacity).toBe('1')
  const fontFamily = await fallback.evaluate(
    (element) => window.getComputedStyle(element).fontFamily,
  )
  expect(fontFamily).toContain('Mojidata-IPAmjMincho')
  expect(fontFamily).toContain('Mojidata-AdobeNotDef')
  expect(fontFamily).not.toContain('Times')
})

test('storybook mojidata section nav mobile story renders', async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 960 })
  await gotoStory(page, 'mojidata-interactive-mojidatasectionnav--mobile')

  await expect(
    page.getByTestId('mojidata-section-nav-mobile'),
  ).toBeVisible()
  await expect(page.getByTestId('mojidata-toc-sidebar')).toBeHidden()
})

test('storybook mojidata section nav desktop story renders', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 })
  await gotoStory(page, 'mojidata-interactive-mojidatasectionnav--desktop')

  await expect(page.locator('aside')).toBeVisible()
  await expect(
    page.getByTestId('mojidata-section-nav-sidebar'),
  ).toBeVisible()
})

test('storybook loading article story renders', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 })
  await gotoStory(page, 'app-pure-views-loading-states--search-results-panel')

  await expect(page.getByTestId('loading-article')).toBeVisible()
})

test('storybook loading mojidata story renders', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 1000 })
  await gotoStory(page, 'app-pure-views-loading-states--mojidata-article')

  await expect(page.getByTestId('loading-mojidata-article')).toBeVisible()
})

test('storybook deferred variants pure collapsed story renders', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 1000 })
  await gotoStory(
    page,
    'mojidata-pure-views-mojidatadeferredvariantsview--collapsed',
  )

  await expect(
    page.getByRole('button', { name: /Show 2 more variants/ }),
  ).toBeVisible()
  await expect(
    page.getByTestId('mojidata-variants-comparison'),
  ).toHaveCount(0)
})

test('storybook deferred variants pure expanded story renders', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 1000 })
  await gotoStory(
    page,
    'mojidata-pure-views-mojidatadeferredvariantsview--expanded',
  )

  await expect(
    page.getByRole('button', { name: /Show fewer variants/ }),
  ).toBeVisible()
  await expect(
    page.getByTestId('mojidata-variants-comparison'),
  ).toBeVisible()
})

test('storybook deferred variants interactive story renders', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 1000 })
  await gotoStory(
    page,
    'mojidata-interactive-mojidatadeferredvariants--default',
  )

  await expect(page.getByRole('button')).toBeVisible()
})

test('storybook moji_joho display control pure auto story renders', async ({
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
    page.getByTestId('moji-joho-display-mode-auto'),
  ).toBeVisible()
})

test('storybook moji_joho display control pure image story renders', async ({
  page,
}) => {
  await gotoStory(
    page,
    'mojidata-pure-views-mojijohodisplaymodecontrolview--image-selected',
  )

  await expect(
    page.getByTestId('moji-joho-display-mode-image'),
  ).toBeVisible()
})

test('storybook moji_joho display control interactive story toggles', async ({
  page,
}) => {
  await gotoStory(
    page,
    'mojidata-interactive-mojijohodisplaymodecontrol--interactive',
  )

  const autoButton = page.getByTestId('moji-joho-display-mode-auto')
  const imageButton = page.getByTestId('moji-joho-display-mode-image')

  await expect(autoButton).toBeVisible()
  await imageButton.click()
  await expect(imageButton).toBeFocused()
})

test('storybook mojidata layout composition desktop story renders', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1200 })
  await gotoStory(page, 'app-layout-compositions-mojidatapage--desktop')

  await expect(page.getByTestId('mojidata-layout-composition')).toBeVisible()
  await expect(page.getByTestId('mojidata-toc-sidebar')).toBeVisible()
})

test('storybook mojidata layout composition mobile story renders', async ({
  page,
}) => {
  await page.setViewportSize({ width: 430, height: 960 })
  await gotoStory(page, 'app-layout-compositions-mojidatapage--mobile')

  await expect(page.getByTestId('mojidata-layout-composition')).toBeVisible()
  await expect(
    page.getByTestId('mojidata-section-nav-mobile'),
  ).toBeVisible()
})

test('storybook search layout composition desktop story renders', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1200 })
  await gotoStory(page, 'app-layout-compositions-searchresultspage--desktop')

  await expect(page.getByTestId('search-layout-page-composition')).toBeVisible()
  await expect(page.getByTestId('search-layout-form-pane')).toBeVisible()
})

test('storybook search layout composition mobile story renders', async ({
  page,
}) => {
  await page.setViewportSize({ width: 430, height: 960 })
  await gotoStory(page, 'app-layout-compositions-searchresultspage--mobile')

  await expect(page.getByTestId('search-layout-page-composition')).toBeVisible()
  await expect(page.getByTestId('search-layout-form-pane')).toBeVisible()
})
