import { devices } from '@playwright/test'
import { expect, test } from './fixtures'
import { characterResult, dismissPreview, expectSingleCharacter } from './workflows'

for (const lang of ['ja-JP', 'en-US'] as const) {
  test.describe(`navigation and help: ${lang}`, () => {
    test.use({ locale: lang })

    test('header links reach search, IDS Finder, about, license and privacy pages', async ({ page }) => {
      await page.goto('/search', { waitUntil: 'domcontentloaded' })
      await expect(page.locator('html')).toHaveAttribute('lang', lang)
      const primary = page.getByRole('navigation', { name: 'Primary', exact: true })
      await primary.getByRole('link', { name: 'IDS Finder', exact: true }).click()
      await expect(page).toHaveURL(/\/idsfind$/)
      await expect(page.getByRole('heading', { name: 'IDS Finder', exact: true })).toBeVisible()
      await primary.getByRole('link', { name: lang === 'ja-JP' ? 'Mojidata 検索' : 'Mojidata Search', exact: true }).click()
      await expect(page).toHaveURL(/\/search$/)

      for (const [name, path, heading] of [
        [lang === 'ja-JP' ? 'このアプリについて' : 'About This App', 'about', lang === 'ja-JP' ? 'Mojidata Web Appについて' : 'About Mojidata Web App'],
        [lang === 'ja-JP' ? 'ライセンス' : 'License', 'license', 'Mojidata Web App License'],
        [lang === 'ja-JP' ? 'プライバシーポリシー' : 'Privacy Policy', 'privacy-policy', 'Privacy Policy'],
      ]) {
        if (new URL(page.url()).hostname !== 'mojidata.ryusei.dev') {
          await expect(page.getByRole('status').filter({ hasText: 'This is a preview' })).toBeVisible()
        }
        const menu = page.getByRole('menu', { name: 'Secondary navigation' })
        if (!(await menu.isVisible())) await page.locator('header summary').click()
        await page.getByRole('menuitem', { name, exact: true }).click()
        await expect(page).toHaveURL(new RegExp(`/${path}$`))
        await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
        await expect(page.locator('html')).toHaveAttribute('lang', lang)
      }
      await page.locator('header').getByRole('link', { name: 'Mojidata Web App', exact: true }).click()
      await expect(page).toHaveURL(/\/search$/)
    })

    test('search help shows every syntax/property tab and closes by button and Escape', async ({ page }) => {
      await page.goto('/search', { waitUntil: 'domcontentloaded' })
      await dismissPreview(page)
      const trigger = page.getByRole('button', { name: lang === 'ja-JP' ? '使い方' : 'Usage', exact: true })
      await trigger.click()
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
      const tabs = lang === 'ja-JP'
        ? ['IDS・文字指定', '読み・画数・MJ', '定型記法', 'プロパティ一覧（Non-Unihan）', 'Unihan: Variants', 'Unihan: IRG sources', 'Unihan: Numerics', 'Unihan: Readings', 'Unihan: その他', 'Unihan: kStrange']
        : ['IDS & character', 'Reading, strokes & MJ', 'Formal syntax', 'Property list (Non-Unihan)', 'Unihan: Variants', 'Unihan: IRG sources', 'Unihan: Numerics', 'Unihan: Readings', 'Unihan: Others', 'Unihan: kStrange']
      const examples = ['U+21234', 'MJ052285', 'mji.読み~カ*', 'mji.MJ文字図形名', 'unihan.kTraditionalVariant', 'unihan.kIRG_JSource', 'unihan.kPrimaryNumeric', 'unihan.kMandarin', 'unihan.kDefinition', 'unihan.kStrange.K']
      for (const [index, tab] of tabs.entries()) {
        await dialog.getByRole('button', { name: tab, exact: true }).click()
        await expect(dialog.getByRole('table')).toContainText(examples[index])
      }
      await dialog.getByRole('button', { name: 'Close', exact: true }).click()
      await expect(dialog).toHaveCount(0)
      await expect(trigger).toBeFocused()
      await trigger.click()
      await page.keyboard.press('Escape')
      await expect(dialog).toHaveCount(0)
      await expect(trigger).toBeFocused()
    })

    test('IDS operator help opens and closes without changing the search', async ({ page }) => {
      await page.goto('/idsfind', { waitUntil: 'domcontentloaded' })
      await dismissPreview(page)
      const url = page.url()
      await page.getByRole('button', { name: lang === 'ja-JP' ? 'IDS演算子一覧' : 'List of IDS Operators', exact: true }).click()
      const dialog = page.getByRole('dialog')
      await expect(dialog).toContainText('〾↔↷')
      await expect(dialog).toContainText('⿰⿱⿴⿵⿶⿷⿸⿹⿺⿻')
      await expect(dialog).toContainText('⿲⿳')
      await page.keyboard.press('Escape')
      await expect(dialog).toHaveCount(0)
      await expect(page).toHaveURL(url)
    })
  })
}

test('preview notice dismissal survives reload', async ({ page }) => {
  await page.goto('/en-US/about', { waitUntil: 'domcontentloaded' })
  const notice = page.getByRole('status').filter({ hasText: 'This is a preview' })
  await expect(notice).toBeVisible()
  await notice.getByRole('link', { name: 'Open this page on production' }).click({ trial: true })
  await expect(notice.getByRole('link', { name: 'Open this page on production' })).toHaveAttribute('href', 'https://mojidata.ryusei.dev/en-US/about')
  await notice.getByRole('button', { name: 'Dismiss', exact: true }).click()
  await expect(notice).toHaveCount(0)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(notice).toHaveCount(0)
})

for (const suffix of ['', '-spa']) {
  test.describe(`mobile form drawer: ${suffix || 'canonical'}`, () => {
    test.use({ locale: 'ja-JP', userAgent: devices['iPhone 13'].userAgent, viewport: { width: 390, height: 844 } })

    for (const feature of ['search', 'idsfind']) {
      test(`${feature} drawer edits and submits a second search`, async ({ page }) => {
        await page.goto(`/ja-JP/${feature}${suffix}?query=${encodeURIComponent('：明')}`, { waitUntil: 'domcontentloaded' })
        await dismissPreview(page)
        await expectSingleCharacter(page, '明')
        const label = feature === 'search' ? 'Mojidata 検索' : 'IDS Finder'
        await page.getByRole('button', { name: label, exact: true }).click()
        const drawer = page.getByRole('dialog', { name: label, exact: true })
        await expect(drawer).toBeVisible()
        await drawer.getByRole('button', { name: 'Close', exact: true }).click()
        await expect(drawer).toHaveCount(0)
        await page.getByRole('button', { name: label, exact: true }).click()
        await drawer.locator('input[name="query"]').fill('：日')
        await drawer.getByRole('button', { name: '検索', exact: true }).click()
        await expectSingleCharacter(page, '日')
        // Depending on whether the results shell remounts, submission may
        // close the drawer or retain it for further edits.
        if (await drawer.isVisible()) await drawer.getByRole('button', { name: 'Close', exact: true }).click()
        await expect(drawer).toHaveCount(0)
      })
    }
  })
}

test('code point detail URLs redirect to the requested BMP and supplementary characters', async ({ page }) => {
  for (const [code, char] of [['U+6F22', '漢'], ['U21234', '𡈴']]) {
    await page.goto(`/ja-JP/mojidata/${code}`, { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(new RegExp(`/mojidata/${encodeURIComponent(char)}$`))
    await expect(page.getByTestId('mojidata-summary-wrap')).toContainText(`U+${char.codePointAt(0)!.toString(16).toUpperCase()}`)
  }
})

test.describe('progressive enhancement without JavaScript', () => {
  test.use({ javaScriptEnabled: false, locale: 'ja-JP', userAgent: devices['iPhone 13'].userAgent, viewport: { width: 390, height: 844 } })

  for (const feature of ['search', 'idsfind']) {
    test(`${feature} form, pagination and character links work without hydration`, async ({ page }) => {
      await page.goto(`/ja-JP/${feature}`, { waitUntil: 'domcontentloaded' })
      const form = page.locator('form:visible')
      await form.locator(feature === 'search' ? 'input[name="query"]' : 'input[placeholder="IDS #1"]').fill('日')
      await form.getByRole('button', { name: '検索', exact: true }).click()
      await expect(page.locator('article footer')).toContainText('page 1 of')
      await page.getByRole('link', { name: 'Next', exact: true }).click()
      await expect(page.locator('article footer')).toContainText('page 2 of')
      await page.getByRole('link', { name: 'Prev', exact: true }).click()
      await expect(page.locator('article footer')).toContainText('page 1 of')
      // On small screens the no-JS fallback is a native details disclosure.
      await page.locator('main details > summary').click()
      await page.locator('form:visible input[name="query"]').fill('：明')
      await page.locator('form:visible').getByRole('button', { name: '検索', exact: true }).click()
      await expectSingleCharacter(page, '明')
      await characterResult(page, '明').click()
      await expect(page.getByTestId('mojidata-summary-wrap')).toContainText('U+660E')
      expect(JSON.parse(await page.locator('article pre').innerText()).UCS).toBe('U+660E')
    })
  }
})
