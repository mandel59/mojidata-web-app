import { expect, test } from './fixtures'
import {
  characterResult, expectBackend, expectParams, expectSingleCharacter,
  resultHrefs, resultLinks, submitSearch, waitForFormHydration, workflowProfiles,
} from './workflows'

for (const profile of workflowProfiles) {
  test.describe(`search workflows: ${profile.name}`, () => {
    test.use({ locale: 'ja-JP', viewport: { width: 1280, height: 900 }, ...('userAgent' in profile ? { userAgent: profile.userAgent } : {}) })

    test.beforeEach(async ({ page }) => {
      await page.goto(`/ja-JP/search${profile.suffix}`, { waitUntil: 'domcontentloaded' })
      await waitForFormHydration(page)
    })

    test('character, kana and supplementary code point queries return the requested character', async ({ page }) => {
      for (const [query, char] of [
        ['：日', '日'], ['char:明', '明'], ['U+21234', '𡈴'], ['：あ', 'あ'],
      ]) {
        await test.step(query, async () => {
          await submitSearch(page, query)
          await expectSingleCharacter(page, char)
          await expectBackend(page, 'search', profile.clientData)
        })
      }
    })

    test('component, whole and wildcard IDS syntax finds matching characters', async ({ page }) => {
      for (const query of ['日 月', '⿰日月', 'ids:⿰日月', '＠⿰？月', 'whole:⿰？月']) {
        await test.step(query, async () => {
          await submitSearch(page, query)
          await expect(characterResult(page, '明')).toBeVisible()
          await expectBackend(page, 'search', profile.clientData)
        })
      }
    })

    test('readings, reading prefixes, MJ names and shorthand stroke conditions work', async ({ page }) => {
      for (const [query, char] of [
        ['あか', '赤'], ['あか*', '明'], ['カン ：漢', '漢'], ['MJ000001', '々'],
        ['：日 4', '日'], ['：日 ４', '日'], ['：日 =4', '日'],
        ['：日 <=4', '日'], ['：日 >=4', '日'], ['：日 <5', '日'], ['：日 >3', '日'],
      ]) {
        await test.step(query, async () => {
          await submitSearch(page, query)
          await expect(characterResult(page, char)).toBeVisible()
          await expectBackend(page, 'search', profile.clientData)
        })
      }
    })

    test('formal comparisons and glob operators filter results instead of only accepting syntax', async ({ page }) => {
      for (const condition of [
        'totalStrokes=4', 'totalStrokes!=5', 'totalStrokes<5', 'totalStrokes<=4',
        'totalStrokes>3', 'totalStrokes>=4', 'mji.読み~ニ*', 'mji.読み!~カ*',
        'UCS=65E5', 'ucs=65E5',
      ]) {
        await test.step(condition, async () => {
          await submitSearch(page, `：日 ${condition}`)
          await expectSingleCharacter(page, '日')
          await expectBackend(page, 'search', profile.clientData)
        })
      }
      for (const condition of [
        'totalStrokes=5', 'totalStrokes!=4', 'totalStrokes<4', 'totalStrokes<=3',
        'totalStrokes>4', 'totalStrokes>=5', 'mji.読み~ZZZ*', 'mji.読み!~*',
        'UCS!=65E5', 'ucs=660E',
      ]) {
        await test.step(`non-matching ${condition}`, async () => {
          await submitSearch(page, `：日 ${condition}`)
          await expect(page.getByText('No results found.', { exact: true })).toBeVisible()
          await expect(resultLinks(page)).toHaveCount(0)
        })
      }
    })

    test('quick examples populate the form and can all be submitted', async ({ page }) => {
      for (const [example, char] of [
        ['⿰日月', '明'], ['＠⿰？月', '明'], ['：日', '日'], ['U+21234', '𡈴'],
        ['totalStrokes<=5', '々'], ['mji.読み~カ*', '㐄'],
        ['unihan.kTraditionalVariant=線', '缐'], ['unihan.kStrange.K=カ', '𫦤'],
      ]) {
        await test.step(example, async () => {
          await page.getByRole('link', { name: example, exact: true }).click()
          await expect(page.locator('input[name="query"]:visible')).toHaveValue(example)
          await expectParams(page, { query: example, page: null })
          await page.getByRole('button', { name: /^(検索|Search)$/ }).click()
          await expect(characterResult(page, char)).toBeVisible()
          await expectBackend(page, 'search', profile.clientData)
        })
      }
    })

    test('paging preserves the query, changes results, and restores the first page', async ({ page }) => {
      await submitSearch(page, '日')
      await expect(resultLinks(page)).toHaveCount(50)
      const firstPage = await resultHrefs(page)
      await expect(page.getByRole('link', { name: 'Prev', exact: true })).toHaveCount(0)
      await page.getByRole('link', { name: 'Next', exact: true }).click()
      await expectParams(page, { query: '日', page: '2' })
      await expect(page.locator('article footer')).toContainText('page 2 of')
      await expect.poll(() => resultHrefs(page)).not.toEqual(firstPage)
      await expectBackend(page, 'search', profile.clientData)
      await page.getByRole('link', { name: 'Prev', exact: true }).click()
      await expect(page.locator('article footer')).toContainText('page 1 of')
      await expect.poll(() => resultHrefs(page)).toEqual(firstPage)

      await submitSearch(page, 'U+21234')
      await expectSingleCharacter(page, '𡈴')
      expect(new URL(page.url()).searchParams.has('page')).toBe(false)
      await expect(page.getByRole('link', { name: 'Next', exact: true })).toHaveCount(0)
    })

    test('no results and an empty submission clear old results and allow another search', async ({ page }) => {
      await submitSearch(page, '：明')
      await expectSingleCharacter(page, '明')
      await submitSearch(page, 'U+10FFFF')
      await expect(page.getByText('No results found.', { exact: true })).toBeVisible()
      await expect(resultLinks(page)).toHaveCount(0)
      await expect(page.getByRole('link', { name: /^(Next|Prev)$/ })).toHaveCount(0)
      await submitSearch(page, '')
      await expect(page.locator('article')).toHaveCount(0)
      await submitSearch(page, '：日')
      await expectSingleCharacter(page, '日')
    })

    test('browser back, forward and reload restore the search results', async ({ page }) => {
      await submitSearch(page, '：明')
      await expectSingleCharacter(page, '明')
      await submitSearch(page, '：日')
      await expectSingleCharacter(page, '日')
      await page.goBack()
      await expectParams(page, { query: '：明' })
      await expectSingleCharacter(page, '明')
      await page.goForward()
      await expectParams(page, { query: '：日' })
      await expectSingleCharacter(page, '日')
      await page.reload({ waitUntil: 'domcontentloaded' })
      await expectSingleCharacter(page, '日')
      await expectBackend(page, 'search', profile.clientData)
    })
  })
}
