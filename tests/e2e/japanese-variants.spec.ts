import { expect, test } from './fixtures'

for (const executionMode of ['server-data', 'client-data']) {
  test(`Japanese variant searches return multiple old forms in ${executionMode}`, async ({ page }) => {
    test.setTimeout(180_000)
    for (const [query, expected] of [
      ['unihan.kJapaneseNewVariant=U+5F01', ['瓣', '辨', '辯']],
      ['unihan.kJapaneseOldVariant=瓣', ['弁']],
    ] as const) {
      await page.goto(`/ja-JP/search?executionMode=${executionMode}&query=${encodeURIComponent(query)}`)
      for (const char of expected) {
        await expect(page.locator(`article a[href$="/mojidata/${encodeURIComponent(char)}"]`).first()).toBeVisible({ timeout: 60_000 })
      }
    }
  })

  test(`Japanese variant details show both relations in ${executionMode}`, async ({ page }) => {
    test.setTimeout(180_000)
    await page.goto(`/ja-JP/mojidata/${encodeURIComponent('弁')}?executionMode=${executionMode}`)
    const article = page.getByTestId('mojidata-response')
    await expect(article).toBeVisible({ timeout: 60_000 })
    await expect(article).toContainText('kJapaneseOldVariant')
    await expect(article).toContainText('kJapaneseNewVariant')
    for (const char of ['瓣', '辨', '辯']) await expect(article).toContainText(char)
  })
}
