import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('license page displays bundled original font and database notices', async ({page, request}) => {
  await page.goto('/ja-JP/license')
  if (new URL(page.url()).hostname !== 'mojidata.ryusei.dev') {
    await page.getByRole('button', {name: 'Dismiss', exact: true}).click()
  }
  const ipa = page.locator('section').filter({has:page.getByRole('heading',{name:'IPAmjMincho',exact:true})})
  await ipa.locator('summary').first().click()
  await expect(ipa.locator('pre').first()).toContainText('IPA Font License')
  const cjk = page.locator('section').filter({has:page.getByRole('heading',{name:'CJK Symbols',exact:true})})
  await cjk.locator('summary').first().click()
  await expect(cjk.locator('pre').first()).toContainText('SIL OPEN FONT LICENSE')
  for (const name of ['mojidata', 'idsdb', 'idsdb-fts5']) {
    const directory = `node_modules/@mandel59/${name}`
    const identity = JSON.parse(await readFile(`${directory}/package.json`, 'utf8'))
    const section = page.locator('section').filter({
      has: page.getByRole('heading', {name: `${identity.name} ${identity.version}`, exact: true}),
    })
    await expect(section).toBeVisible()
    const babelStone = section.locator('details').filter({
      has: page.locator('summary', {hasText: /^licenses\/babelstone-ids\.txt$/}),
    })
    await babelStone.locator('summary').click()
    const expectedNotice = await readFile(`${directory}/licenses/babelstone-ids.txt`, 'utf8')
    await expect(babelStone.locator('pre')).toHaveText(expectedNotice)
    await expect(babelStone.locator('pre')).toContainText('Kawabata Taichi')
    await expect(babelStone.locator('pre')).toContainText('Michel Mariani')
    const response = await request.get(`/assets/${name}/licenses/babelstone-ids.txt`)
    expect(response.status()).toBe(200)
    expect(await response.text()).toBe(expectedNotice)
  }
  const glyphWiki = page.locator('section').filter({has:page.getByRole('heading',{name:'GlyphWiki',exact:true})})
  await glyphWiki.locator('summary').first().click()
  await expect(glyphWiki.locator('pre')).toHaveText(await readFile('src/licensing/glyphwiki/license.txt', 'utf8'))
  const notice = await request.get('/assets/mojidata/licenses/cjkvi-variants.txt')
  expect(notice.status()).toBe(200)
  expect(await notice.body()).toEqual(await readFile('node_modules/@mandel59/mojidata/licenses/cjkvi-variants.txt'))
  const manifest = await request.get('/assets/idsdb-fts5/data-notices.json')
  expect(manifest.status()).toBe(200)
  expect((await manifest.json()).package).toBe('@mandel59/idsdb-fts5')
  const head = await request.head('/assets/mojidata/licenses/mj.txt')
  expect(head.status()).toBe(200)
  expect(head.headers()['content-type']).toContain('text/plain')
  expect((await request.get('/assets/glyph-paths/v1/ipamjm/u34.json.gz')).status()).toBe(404)
  const font = await page.locator('link[rel="preload"][as="font"]').first().getAttribute('href')
  expect(font).toBeTruthy()
  expect((await request.get(font!)).status()).toBe(200)
})
