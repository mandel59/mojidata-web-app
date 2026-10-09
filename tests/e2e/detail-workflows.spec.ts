import { expect, test } from './fixtures'
import { characterResult, dismissPreview, expectBackend, idsInput, submitSearch, waitForFormHydration, workflowProfiles } from './workflows'

for (const profile of workflowProfiles) {
  test.describe(`character detail workflows: ${profile.name}`, () => {
    test.use({ locale: 'ja-JP', viewport: { width: 1280, height: 900 }, ...('userAgent' in profile ? { userAgent: profile.userAgent } : {}) })

    for (const feature of ['search', 'idsfind']) {
      test(`${feature} result opens canonical character data with matching JSON`, async ({ page }) => {
        await page.goto(`/ja-JP/${feature}${profile.suffix}`, { waitUntil: 'domcontentloaded' })
        await waitForFormHydration(page)
        if (feature === 'search') await submitSearch(page, '：明')
        else {
          await idsInput(page).fill('⿰日月')
          await page.getByRole('button', { name: '検索', exact: true }).click()
        }
        const result = characterResult(page, '明')
        await expect(result).toHaveAttribute('href', `/mojidata/${encodeURIComponent('明')}`)
        await result.click()
        await expect(page).toHaveURL(/\/mojidata\/%E6%98%8E$/)
        await expect(page.getByTestId('mojidata-response')).toBeVisible()
        await expect(page.getByTestId('mojidata-summary-wrap')).toContainText('U+660E')
        await expectBackend(page, 'mojidata', profile.clientData)
        const json = JSON.parse(await page.locator('article pre').innerText())
        expect(json.UCS).toBe('U+660E')
        await expect(page.locator('#IDS + table')).toContainText('⿰日月')
      })
    }

    test('all section links reach their headings and expose character data and external links', async ({ page }) => {
      await page.goto(`/ja-JP/mojidata${profile.suffix}/${encodeURIComponent('漢')}`, { waitUntil: 'domcontentloaded' })
      await dismissPreview(page)
      await expect(page.getByTestId('mojidata-response')).toBeVisible()
      const nav = page.getByTestId('mojidata-section-nav-sidebar')
      for (const id of ['Character_Data', 'Glyph_Comparison', 'Variants', 'External_Links', 'JSON']) {
        await test.step(id, async () => {
          await nav.locator(`a[href="#${id}"]`).click()
          await expect(page).toHaveURL(new RegExp(`#${id}$`))
          await expect.poll(() => page.locator(`[id="${id}"]`).evaluate(
            (el) => Math.abs(el.getBoundingClientRect().top),
          )).toBeLessThan(220)
        })
      }
      await expect(page.locator('#Regional_Differences')).toBeVisible()
      await expect(page.locator('#Adobe-Japan1')).toBeVisible()
      await expect(page.getByRole('link', { name: 'u6f22 (漢) - GlyphWiki', exact: true })).toHaveAttribute('href', 'https://glyphwiki.org/wiki/u6f22')
      await expect(page.getByRole('link', { name: '漢: zi.tools', exact: true })).toHaveAttribute('href', `https://zi.tools/zi/${encodeURIComponent('漢')}`)
    })

    test('Moji_Joho image and automatic display modes update the URL and survive reload', async ({ page }) => {
      test.setTimeout(90_000)
      await page.goto(`/ja-JP/mojidata${profile.suffix}/${encodeURIComponent('漢')}`, { waitUntil: 'domcontentloaded' })
      await dismissPreview(page)
      await page.getByTestId('moji-joho-display-mode-image').click()
      await expect.poll(() => new URL(page.url()).searchParams.get('mojiJohoImage')).toBe('1')
      await expect(page.locator('img[src^="/api/ipamjm/svg/"]').first()).toBeVisible()
      await page.reload({ waitUntil: 'domcontentloaded' })
      // Reload rebuilds the browser database worker, which can take longer
      // than an ordinary view update, especially under WebKit.
      await expect(page.getByTestId('mojidata-response')).toBeVisible({ timeout: 60_000 })
      await expect(page.locator('img[src^="/api/ipamjm/svg/"]').first()).toBeVisible()
      await expect(async () => {
        await page.getByTestId('moji-joho-display-mode-auto').click()
        expect(new URL(page.url()).searchParams.has('mojiJohoImage')).toBe(false)
      }).toPass({ timeout: 15_000 })
      await expectBackend(page, 'mojidata', profile.clientData)
    })

    test('extra variants expand, collapse and link to the selected character', async ({ page }) => {
      await page.goto(`/ja-JP/mojidata${profile.suffix}/${encodeURIComponent('水')}`, { waitUntil: 'domcontentloaded' })
      await dismissPreview(page)
      const extra = page.getByTestId('mojidata-deferred-variants-view')
      const toggle = extra.getByRole('button')
      await expect(toggle).toHaveAttribute('aria-expanded', 'false')
      await expect(extra.locator('figure')).toHaveCount(0)
      await toggle.click()
      await expect(toggle).toHaveAttribute('aria-expanded', 'true')
      await expect(extra.locator('figure').first()).toBeVisible()
      const link = extra.locator('a[href*="/mojidata/"]').first()
      const href = await link.getAttribute('href')
      expect(href).toBeTruthy()
      const char = decodeURIComponent(href!.split('/').pop()!)
      await toggle.click()
      await expect(toggle).toHaveAttribute('aria-expanded', 'false')
      await expect(extra.locator('figure')).toHaveCount(0)
      await toggle.click()
      await link.click()
      await expect(page.getByTestId('mojidata-summary-wrap')).toContainText(
        `U+${char.codePointAt(0)!.toString(16).toUpperCase()}`,
      )
      expect(JSON.parse(await page.locator('article pre').innerText()).UCS).toBe(
        `U+${char.codePointAt(0)!.toString(16).toUpperCase()}`,
      )
    })

    test('permalink copies the character URL without display parameters or section fragments', async ({ page }) => {
      // The OS clipboard is outside the app. Capture the browser API boundary
      // so the same behavior is verifiable in Chromium and WebKit.
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', { value: {
          writeText: async (value: string) => {
            document.documentElement.dataset.copiedPermalink = value
          },
        } })
      })
      await page.goto(`/ja-JP/mojidata${profile.suffix}/${encodeURIComponent('漢')}?mojiJohoImage=1#JSON`, { waitUntil: 'domcontentloaded' })
      await dismissPreview(page)
      const permalink = page.getByTestId('mojidata-permalink-button')
      await permalink.click()
      await expect(permalink).toHaveText('コピーしました')
      const url = new URL(page.url())
      await expect(page.locator('html')).toHaveAttribute('data-copied-permalink', `${url.origin}${url.pathname}`)
    })
  })
}
