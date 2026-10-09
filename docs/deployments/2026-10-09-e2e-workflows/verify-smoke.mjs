import { writeFile } from 'node:fs/promises'
import { chromium, devices, expect } from '@playwright/test'

const [baseUrl, outputPath] = process.argv.slice(2)
if (!baseUrl || !outputPath) throw new Error('Usage: node verify-smoke.mjs <base-url> <output-json>')
const checks = []
const errors = []
const serverDocuments = []
const browser = await chromium.launch()

function observe(page, server = false) {
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  if (server) page.on('request', (request) => {
    if (request.resourceType() === 'document') serverDocuments.push(request.url())
  })
}

const searchButton = (page) => page.getByRole('button', { name: /^(検索|Search)$/ })
const result = (page, char) => page.locator(`article a[href$="/mojidata/${encodeURIComponent(char)}"]`)

async function readyForm(page, helpName) {
  if (new URL(page.url()).hostname !== 'mojidata.ryusei.dev') {
    const dismiss = page.getByRole('button', { name: 'Dismiss', exact: true })
    if (await dismiss.isVisible()) await dismiss.click()
  }
  await expect(async () => {
    await page.getByRole('button', { name: helpName, exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 1000 })
  }).toPass({ timeout: 15_000 })
  await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click()
}

try {
  const context = await browser.newContext({ baseURL: baseUrl, locale: 'ja-JP', viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  observe(page)
  await page.goto('/ja-JP/search')
  if (new URL(page.url()).hostname !== 'mojidata.ryusei.dev') {
    await page.getByRole('button', { name: 'Dismiss', exact: true }).click()
  }
  await readyForm(page, '使い方')
  await page.locator('input[name="query"]:visible').fill('：日 ucs=65E5')
  await searchButton(page).click()
  await expect(result(page, '日')).toBeVisible({ timeout: 60_000 })
  await expect(page.locator('[data-spa="search"]')).toHaveCount(1)
  await expect(page.locator('article a[href*="/mojidata/"]')).toHaveCount(1)
  checks.push('client-data lowercase ucs condition returns 日')

  await page.goto('/ja-JP/idsfind')
  await readyForm(page, 'IDS演算子一覧')
  await page.locator('form:visible').getByPlaceholder('IDS #1').fill('⿰日月')
  await searchButton(page).click()
  await expect(result(page, '明')).toBeVisible({ timeout: 60_000 })
  await expect(page.locator('[data-spa="idsfind"]')).toHaveCount(1)
  expect(new URL(page.url()).searchParams.get('whole')).toBe('')
  checks.push('client-data IDS form with empty whole/query returns 明')
  await result(page, '明').click()
  await expect(page.getByTestId('mojidata-response')).toBeVisible({ timeout: 60_000 })
  expect(JSON.parse(await page.locator('article pre').innerText()).UCS).toBe('U+660E')
  checks.push('client-data detail navigation returns matching JSON')
  await context.close()

  // Limit remote API smoke traffic to exact-character conditions and one
  // character detail. Broad searches and the full suite run locally.
  const native = await browser.newContext({
    baseURL: baseUrl, locale: 'ja-JP', javaScriptEnabled: false,
    userAgent: devices['iPhone 13'].userAgent, viewport: { width: 1280, height: 900 },
  })
  const nativePage = await native.newPage()
  observe(nativePage, true)
  await nativePage.goto('/ja-JP/search')
  await nativePage.locator('input[name="query"]:visible').fill('：日 ucs=65E5')
  await searchButton(nativePage).click()
  await expect(result(nativePage, '日')).toBeVisible({ timeout: 60_000 })
  await expect(nativePage.locator('[data-spa="search"]')).toHaveCount(0)
  await expect(nativePage.locator('article footer')).toContainText('page 1 of 1')
  checks.push('no-JavaScript search submission renders visible server results')

  await nativePage.goto('/ja-JP/idsfind')
  await nativePage.locator('form:visible').getByPlaceholder('IDS #1').fill('⿰日月')
  await nativePage.locator('input[name="query"]:visible').fill('U+660E')
  await searchButton(nativePage).click()
  await expect(result(nativePage, '明')).toBeVisible({ timeout: 60_000 })
  expect(new URL(nativePage.url()).searchParams.get('ids')).toBe('⿰日月')
  await expect(nativePage.locator('[data-spa="idsfind"]')).toHaveCount(0)
  checks.push('no-JavaScript IDS input is submitted and renders visible server results')
  await result(nativePage, '明').click()
  await expect(nativePage.getByTestId('mojidata-response')).toBeVisible({ timeout: 60_000 })
  expect(JSON.parse(await nativePage.locator('article pre').innerText()).UCS).toBe('U+660E')
  checks.push('no-JavaScript character detail renders visible data and JSON')
  await native.close()
  expect(errors).toEqual([])
} finally {
  await browser.close()
  await writeFile(outputPath, JSON.stringify({ checkedAt: new Date().toISOString(), baseUrl, checks, errors, serverDocuments }, null, 2) + '\n')
}
console.log(`${checks.length} smoke checks passed: ${baseUrl}`)
