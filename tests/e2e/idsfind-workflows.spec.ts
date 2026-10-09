import { expect, test } from './fixtures'
import {
  characterResult, expectBackend, expectParams, expectSingleCharacter,
  idsInput, resultHrefs, resultLinks, waitForFormHydration, workflowProfiles,
} from './workflows'

for (const profile of workflowProfiles) {
  test.describe(`IDS Finder workflows: ${profile.name}`, () => {
    test.use({ locale: 'ja-JP', viewport: { width: 1280, height: 900 }, ...('userAgent' in profile ? { userAgent: profile.userAgent } : {}) })

    test.beforeEach(async ({ page }) => {
      await page.goto(`/ja-JP/idsfind${profile.suffix}`, { waitUntil: 'domcontentloaded' })
      await waitForFormHydration(page)
    })

    test('each field works alone with the other fields empty', async ({ page }) => {
      const fields = [
        { input: idsInput(page, 1), value: '⿰日月', key: 'ids' },
        { input: page.locator('input[name="whole"]:visible'), value: '⿰日月', key: 'whole' },
        { input: page.locator('input[name="query"]:visible'), value: '：明', key: 'query' },
      ]
      for (const field of fields) {
        await test.step(field.key, async () => {
          for (const other of fields) await other.input.fill('')
          await field.input.fill(field.value)
          await page.getByRole('button', { name: /^(検索|Search)$/ }).click()
          await expectParams(page, { [field.key]: field.value })
          await expect(characterResult(page, '明')).toBeVisible()
          await expectBackend(page, 'idsfind', profile.clientData)
          if (field.key === 'query') await expectSingleCharacter(page, '明')
        })
      }
    })

    test('multiple IDS fields combine with whole and query conditions, and can be removed', async ({ page }) => {
      await idsInput(page, 1).fill('⿰日？')
      await expect(idsInput(page, 2)).toBeVisible()
      await idsInput(page, 2).fill('月')
      await expect(idsInput(page, 3)).toBeVisible()
      await page.locator('input[name="whole"]:visible').fill('⿰？月')
      await page.locator('input[name="query"]:visible').fill('U+660E')
      await page.getByRole('button', { name: /^(検索|Search)$/ }).click()
      await expectParams(page, { ids: ['⿰日？', '月', ''], whole: '⿰？月', query: 'U+660E' })
      await expectSingleCharacter(page, '明')
      await expectBackend(page, 'idsfind', profile.clientData)

      // Each of the three kinds of filter must be able to exclude the known
      // match independently. This catches a backend dropping one condition.
      await idsInput(page, 2).fill('水')
      await page.getByRole('button', { name: /^(検索|Search)$/ }).click()
      await expectParams(page, { ids: ['⿰日？', '水', ''], query: 'U+660E' })
      await expect(page.getByText('No results found.', { exact: true })).toBeVisible()
      await idsInput(page, 2).fill('月')
      await page.locator('input[name="whole"]:visible').fill('⿱日月')
      await page.getByRole('button', { name: /^(検索|Search)$/ }).click()
      await expectParams(page, { whole: '⿱日月', query: 'U+660E' })
      await expect(page.getByText('No results found.', { exact: true })).toBeVisible()
      await page.locator('input[name="whole"]:visible').fill('⿰？月')

      // A contradictory property must eliminate the result, proving that the
      // query field is combined with the IDS filters rather than ignored.
      await page.locator('input[name="query"]:visible').fill('U+6C34')
      await page.getByRole('button', { name: /^(検索|Search)$/ }).click()
      await expectParams(page, { query: 'U+6C34' })
      await expect(page.getByText('No results found.', { exact: true })).toBeVisible()
      await expect(resultLinks(page)).toHaveCount(0)

      await idsInput(page, 2).fill('')
      await page.locator('input[name="whole"]:visible').fill('')
      await page.locator('input[name="query"]:visible').fill('')
      await expect(idsInput(page, 3)).toHaveCount(0)
      await page.getByRole('button', { name: /^(検索|Search)$/ }).click()
      await expectParams(page, { ids: ['⿰日？', ''], whole: '', query: '' })
      await expect(characterResult(page, '明')).toBeVisible()
    })

    test('quick examples reset all other fields and submit successfully', async ({ page }) => {
      for (const [example, ids, whole, query] of [
        ['IDS: ⿰日月', '⿰日月', '', ''],
        ['Whole: ⿰？月', '', '⿰？月', ''],
        ['Query: ：日', '', '', '：日'],
      ]) {
        await test.step(example, async () => {
          await idsInput(page, 1).fill('水')
          await page.locator('input[name="whole"]:visible').fill('水')
          await page.locator('input[name="query"]:visible').fill('U+6C34')
          await page.getByRole('link', { name: example, exact: true }).click()
          await expect(idsInput(page, 1)).toHaveValue(ids)
          await expect(page.locator('input[name="whole"]:visible')).toHaveValue(whole)
          await expect(page.locator('input[name="query"]:visible')).toHaveValue(query)
          await expectParams(page, { page: null })
          await page.getByRole('button', { name: /^(検索|Search)$/ }).click()
          await expectParams(page, { ids: ids ? [ids, ''] : [''], whole, query })
          if (query) await expectSingleCharacter(page, '日')
          else await expect(characterResult(page, '明')).toBeVisible()
          await expectBackend(page, 'idsfind', profile.clientData)
        })
      }
    })

    test('paging retains repeated IDS and whole/query filters and resets for a new search', async ({ page }) => {
      await idsInput(page, 1).fill('日')
      await idsInput(page, 2).fill('日')
      await page.locator('input[name="whole"]:visible').fill('？')
      await page.locator('input[name="query"]:visible').fill('totalStrokes>=1')
      await page.getByRole('button', { name: /^(検索|Search)$/ }).click()
      await expectParams(page, { ids: ['日', '日', ''], whole: '？', query: 'totalStrokes>=1' })
      await expect(resultLinks(page)).toHaveCount(50)
      const firstPage = await resultHrefs(page)
      await page.getByRole('link', { name: 'Next', exact: true }).click()
      await expectParams(page, { ids: ['日', '日'], whole: '？', query: 'totalStrokes>=1', page: '2' })
      await expect(page.locator('article footer')).toContainText('page 2 of')
      await expect.poll(() => resultHrefs(page)).not.toEqual(firstPage)
      await expectBackend(page, 'idsfind', profile.clientData)
      await page.getByRole('link', { name: 'Prev', exact: true }).click()
      await expect(page.locator('article footer')).toContainText('page 1 of')
      await expect.poll(() => resultHrefs(page)).toEqual(firstPage)
      await page.getByRole('link', { name: 'Next', exact: true }).click()
      await expect(page.locator('article footer')).toContainText('page 2 of')

      await page.getByRole('link', { name: 'Query: ：日', exact: true }).click()
      await expectParams(page, { page: null })
      await page.getByRole('button', { name: /^(検索|Search)$/ }).click()
      await expectSingleCharacter(page, '日')
      await expect(page.getByRole('link', { name: /^(Next|Prev)$/ })).toHaveCount(0)
    })

    test('whole searches with no results offer zi.tools, then clearing the form removes stale results', async ({ page }) => {
      const whole = '⿰日🦊'
      await page.locator('input[name="whole"]:visible').fill(whole)
      await page.getByRole('button', { name: /^(検索|Search)$/ }).click()
      await expectParams(page, { whole })
      await expect(page.getByText('No results found.', { exact: true })).toBeVisible()
      await expect(resultLinks(page)).toHaveCount(0)
      await expect(page.getByRole('link', { name: `Search zi.tools for ${whole}` })).toHaveAttribute(
        'href', `https://zi.tools/zi/${encodeURIComponent(whole)}`,
      )
      await page.locator('input[name="whole"]:visible').fill('')
      await page.getByRole('button', { name: /^(検索|Search)$/ }).click()
      await expectParams(page, { whole: '' })
      await expect(page.locator('article')).toHaveCount(0)
      await idsInput(page, 1).fill('⿰日月')
      await page.getByRole('button', { name: /^(検索|Search)$/ }).click()
      await expectParams(page, { ids: ['⿰日月', ''] })
      await expect(characterResult(page, '明')).toBeVisible()
      await expectBackend(page, 'idsfind', profile.clientData)
    })

    test('back, forward and reload restore IDS results and form values', async ({ page }) => {
      await idsInput(page, 1).fill('⿰日月')
      await page.getByRole('button', { name: /^(検索|Search)$/ }).click()
      await expect(characterResult(page, '明')).toBeVisible()
      await idsInput(page, 1).fill('⿰水？')
      await page.getByRole('button', { name: /^(検索|Search)$/ }).click()
      await expectParams(page, { ids: ['⿰水？', ''] })
      await expect(characterResult(page, '明')).toHaveCount(0)
      await expect(resultLinks(page).first()).toBeVisible()
      const waterResults = await resultHrefs(page)
      await page.goBack()
      await expectParams(page, { ids: ['⿰日月', ''] })
      await expect(characterResult(page, '明')).toBeVisible()
      await page.goForward()
      await expect.poll(() => resultHrefs(page)).toEqual(waterResults)
      await page.reload({ waitUntil: 'domcontentloaded' })
      await expect(idsInput(page, 1)).toHaveValue('⿰水？')
      await expect.poll(() => resultHrefs(page)).toEqual(waterResults)
      await expectBackend(page, 'idsfind', profile.clientData)
    })
  })
}
