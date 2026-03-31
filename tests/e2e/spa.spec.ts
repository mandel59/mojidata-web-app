import { expect, test } from '@playwright/test'

test('search-spa renders results in browser', async ({ page }) => {
  page.on('pageerror', (err) => console.log('[pageerror]', err))
  page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()))

  const sawWasm = page.waitForRequest((req) =>
    req.url().includes('/assets/sql-wasm.wasm'),
  )
  const sawIdsDb = page.waitForRequest((req) =>
    req.url().includes('/assets/idsfind.db'),
  )
  await page.goto('/ja-JP/search-spa', { waitUntil: 'domcontentloaded' })
  await sawWasm
  await sawIdsDb

  await page.goto('/ja-JP/search-spa?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })

  await expect(page.locator('[data-spa="search"]')).toHaveCount(1)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/search\?query=/,
  )
  await expect(page.locator('.ids-find-result-char').first()).toBeVisible({
    timeout: 60_000,
  })
  await expect(page.locator('.ids-find-result-char a').first()).toHaveAttribute(
    'href',
    /\/mojidata\//,
  )
})

test('canonical search defaults to client-data in browser', async ({ page }) => {
  await page.goto('/ja-JP/search?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })

  await expect(page.locator('[data-spa="search"]')).toHaveCount(1)
  await expect(page.locator('.ids-find-result-char').first()).toBeVisible({
    timeout: 60_000,
  })
})

test('canonical search can render client-data mode in browser', async ({
  page,
}) => {
  await page.goto('/ja-JP/search?executionMode=client-data&query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })

  await expect(page.locator('[data-spa="search"]')).toHaveCount(1)
  await expect(page.locator('.ids-find-result-char').first()).toBeVisible({
    timeout: 60_000,
  })
})

test('canonical search uses two-column layout on desktop', async ({ page }) => {
  await page.goto('/ja-JP/search?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })

  const input = page.locator('#mojidata-query-input:visible').first()
  const result = page.locator('.ids-find-result-char:visible').first()

  await expect(input).toBeVisible()
  await expect(result).toBeVisible({ timeout: 60_000 })

  const inputBox = await input.boundingBox()
  const resultBox = await result.boundingBox()

  expect(inputBox).not.toBeNull()
  expect(resultBox).not.toBeNull()
  expect((inputBox?.x ?? 0) + (inputBox?.width ?? 0)).toBeLessThan(
    resultBox?.x ?? 0,
  )
})

test('mojidata-spa renders character data in browser', async ({ page }) => {
  page.on('pageerror', (err) => console.log('[pageerror]', err))
  page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()))

  await page.goto('/ja-JP/mojidata-spa/%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })

  await expect(page.locator('[data-spa="mojidata"]')).toHaveCount(1)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/mojidata\/%E6%BC%A2$/,
  )
  await expect(page.locator('.mojidata-response')).toHaveCount(1, {
    timeout: 60_000,
  })
  await expect(
    page.locator('.mojidata-response figure').first().locator('figcaption'),
  ).toContainText('U+6F22', {
    timeout: 60_000,
  })
})

test('canonical mojidata can render client-data mode in browser', async ({
  page,
}) => {
  await page.goto('/ja-JP/mojidata/%E6%BC%A2?executionMode=client-data', {
    waitUntil: 'domcontentloaded',
  })

  await expect(page.locator('[data-spa="mojidata"]')).toHaveCount(1)
  await expect(page.locator('.mojidata-response')).toHaveCount(1, {
    timeout: 60_000,
  })
})

test('idsfind-spa renders results in browser', async ({ page }) => {
  page.on('pageerror', (err) => console.log('[pageerror]', err))
  page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()))

  const sawWasm = page.waitForRequest((req) =>
    req.url().includes('/assets/sql-wasm.wasm'),
  )
  const sawIdsDb = page.waitForRequest((req) =>
    req.url().includes('/assets/idsfind.db'),
  )
  await page.goto('/ja-JP/idsfind-spa', { waitUntil: 'domcontentloaded' })
  await sawWasm
  await sawIdsDb

  await page.goto('/ja-JP/idsfind-spa?whole=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })

  await expect(page.locator('[data-spa="idsfind"]')).toHaveCount(1)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/idsfind\?whole=/,
  )
  await expect(page.locator('.ids-find-result-char').first()).toBeVisible({
    timeout: 60_000,
  })
  await expect(page.locator('.ids-find-result-char a').first()).toHaveAttribute(
    'href',
    /\/mojidata\//,
  )
})

test('canonical idsfind can render client-data mode in browser', async ({
  page,
}) => {
  await page.goto(
    '/ja-JP/idsfind?executionMode=client-data&whole=%E6%BC%A2',
    {
      waitUntil: 'domcontentloaded',
    },
  )

  await expect(page.locator('[data-spa="idsfind"]')).toHaveCount(1)
  await expect(page.locator('.ids-find-result-char').first()).toBeVisible({
    timeout: 60_000,
  })
})
