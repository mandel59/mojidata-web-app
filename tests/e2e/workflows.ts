import { devices, type Page } from '@playwright/test'
import { expect } from './fixtures'

// Use delivery policy rather than an executionMode query parameter: real form
// submissions and result links must continue to exercise the intended backend.
export const workflowProfiles = [
  { name: 'canonical client-data', suffix: '', clientData: true },
  {
    name: 'canonical server-data',
    suffix: '',
    clientData: false,
    userAgent: devices['iPhone 13'].userAgent,
  },
  { name: 'explicit SPA', suffix: '-spa', clientData: true },
] as const

export function resultLinks(page: Page) {
  return page.locator('article a[href*="/mojidata/"]')
}

export function idsInput(page: Page, index = 1) {
  return page.locator('form:visible').getByPlaceholder(`IDS #${index}`)
}

export async function dismissPreview(page: Page) {
  if (new URL(page.url()).hostname !== 'mojidata.ryusei.dev') {
    // This client-rendered control appears after hydration. Dismissing it also
    // prevents the toast from covering controls near the bottom of the screen.
    await page.getByRole('button', { name: 'Dismiss', exact: true }).click()
  }
}

export async function waitForFormHydration(page: Page) {
  // Filling a server-rendered controlled input before React hydrates can lose
  // its value. A working help dialog proves the form's handlers are ready.
  await dismissPreview(page)
  await expect(async () => {
    await page.getByRole('button', { name: /^(使い方|Usage|IDS演算子一覧|List of IDS Operators)$/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 1000 })
  }).toPass({ timeout: 15_000 })
  await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
}

export function characterResult(page: Page, char: string) {
  return page.locator(`article a[href$="/mojidata/${encodeURIComponent(char)}"]`)
}

export async function expectBackend(page: Page, feature: string, clientData: boolean) {
  await expect(page.locator(`[data-spa="${feature}"]`)).toHaveCount(clientData ? 1 : 0)
}

export async function resultHrefs(page: Page) {
  return resultLinks(page).evaluateAll((links) => links.map((link) => link.getAttribute('href')))
}

export async function expectParams(page: Page, expected: Record<string, string | string[] | null>) {
  await expect.poll(() => {
    const params = new URL(page.url()).searchParams
    return Object.fromEntries(Object.keys(expected).map((key) => [
      key, Array.isArray(expected[key]) ? params.getAll(key) : params.get(key),
    ]))
  }).toEqual(expected)
  // A localized form may cross into an unlocalized canonical route and cause
  // a document navigation. Wait for it before editing the next form instance.
  await page.waitForLoadState('load')
}

export async function submitSearch(page: Page, query: string) {
  await page.locator('input[name="query"]:visible').fill(query)
  await page.getByRole('button', { name: /^(検索|Search)$/ }).click()
  await expectParams(page, { query })
}

export async function expectSingleCharacter(page: Page, char: string) {
  await expect(characterResult(page, char)).toBeVisible()
  await expect(resultLinks(page)).toHaveCount(1)
  await expect(page.locator('article footer')).toContainText('page 1 of 1')
}
