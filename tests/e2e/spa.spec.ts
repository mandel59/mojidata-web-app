import { expect, test } from './fixtures'
import type { Page, Request } from '@playwright/test'

const SPA_ASSET_CACHE_NAME = 'mojidata-spa-assets-v1'
const OPFS_MANIFEST_DIRECTORY = 'mojidata-web-app-sqlite-wasm'
const OPFS_POOL_DIRECTORY = 'mojidata-opfs-sahpool'

type OpfsManifest = {
  name: string
  assetUrl: string
  assetVersion: string
  byteLength: number
  importedAt: string
}

function firstMojidataResultLink(page: Page) {
  return page.locator('article a[href*="/mojidata/"]').first()
}

function assetNameFromUrl(url: string) {
  const pathname = new URL(url).pathname
  return pathname.split('/').pop() ?? ''
}

function assetNameFromRequest(request: Request) {
  return assetNameFromUrl(request.url())
}

function collectAssetRequests(page: Page, assetNames: string[]) {
  const names = new Set(assetNames)
  const urls: string[] = []
  const listener = (request: Request) => {
    if (names.has(assetNameFromRequest(request))) {
      urls.push(request.url())
    }
  }

  page.on('request', listener)
  return {
    urls,
    dispose: () => page.off('request', listener),
  }
}

async function clearSpaAssetCache(page: Page) {
  await page.goto('/ja-JP/about', { waitUntil: 'domcontentloaded' })
  await page.evaluate(async ({ cacheName, opfsDirectories }) => {
    await caches.delete(cacheName)
    const storage = navigator.storage as StorageManager & {
      getDirectory?: () => Promise<FileSystemDirectoryHandle>
    }
    const root = await storage.getDirectory?.()
    if (!root) return

    await Promise.all(
      opfsDirectories.map(async (name) => {
        await root.removeEntry(name, { recursive: true }).catch(() => undefined)
      }),
    )
  }, {
    cacheName: SPA_ASSET_CACHE_NAME,
    opfsDirectories: [OPFS_MANIFEST_DIRECTORY, OPFS_POOL_DIRECTORY],
  })
}

async function cachedSpaAssetUrls(page: Page) {
  return await page.evaluate(async (cacheName) => {
    const cache = await caches.open(cacheName)
    const requests = await cache.keys()
    return requests.map((request) => request.url)
  }, SPA_ASSET_CACHE_NAME)
}

function hasCachedAsset(cachedUrls: string[], assetName: string) {
  return cachedUrls.some((url) =>
    new URL(url).pathname.endsWith(`/${assetName}`),
  )
}

async function waitForCachedAsset(
  page: Page,
  assetName: string,
  timeout: number,
) {
  await expect
    .poll(
      async () => hasCachedAsset(await cachedSpaAssetUrls(page), assetName),
      { timeout },
    )
    .toBe(true)
}

async function readOpfsManifest(page: Page, segments: string[]) {
  return await page.evaluate(
    async ({ directory, segments }) => {
      const storage = navigator.storage as StorageManager & {
        getDirectory?: () => Promise<FileSystemDirectoryHandle>
      }
      const root = await storage.getDirectory?.()
      if (!root) return null

      try {
        let dir = await root.getDirectoryHandle(directory)
        for (const segment of segments.slice(0, -1)) {
          dir = await dir.getDirectoryHandle(segment)
        }
        const fileName = segments[segments.length - 1]
        const file = await (await dir.getFileHandle(fileName)).getFile()
        return JSON.parse(await file.text()) as OpfsManifest
      } catch (error) {
        if (error instanceof DOMException && error.name === 'NotFoundError') {
          return null
        }
        throw error
      }
    },
    { directory: OPFS_MANIFEST_DIRECTORY, segments },
  )
}

function spaCacheLoadTimeout(projectName: string) {
  return projectName === 'firefox-spa-cache' ? 120_000 : 60_000
}

function configureSpaCacheTestTimeout(testInfo: {
  project: { name: string }
  setTimeout: (timeout: number) => void
}) {
  if (testInfo.project.name !== 'firefox-spa-cache') return
  testInfo.setTimeout(180_000)
}

test('search-spa renders results in browser', async ({ page }) => {
  await page.goto('/ja-JP/search-spa', { waitUntil: 'domcontentloaded' })

  const sawWasm = page.waitForRequest((req) =>
    req.url().includes('/assets/sqlite3.wasm'),
  )
  const sawIdsDb = page.waitForRequest((req) =>
    req.url().includes('/assets/idsfind-fts5.db'),
  )
  await page.goto('/ja-JP/search-spa?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })
  await sawWasm
  await sawIdsDb

  await expect(page.locator('[data-spa="search"]')).toHaveCount(1)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/search\?query=/,
  )
  await expect(firstMojidataResultLink(page)).toBeVisible({
    timeout: 60_000,
  })
  await expect(firstMojidataResultLink(page)).toHaveAttribute(
    'href',
    /\/mojidata\//,
  )
})

test('canonical search defaults to client-data in browser', async ({ page }) => {
  await page.goto('/ja-JP/search?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })

  await expect(page.locator('[data-spa="search"]')).toHaveCount(1)
  await expect(firstMojidataResultLink(page)).toBeVisible({
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
  await expect(firstMojidataResultLink(page)).toBeVisible({
    timeout: 60_000,
  })
})

test('canonical search uses two-column layout on desktop', async ({ page }) => {
  await page.goto('/ja-JP/search?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })

  const input = page.locator('#mojidata-query-input:visible').first()
  const result = firstMojidataResultLink(page)

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

test('canonical search paging keeps results visible on desktop', async ({
  page,
}) => {
  await page.goto('/ja-JP/search?query=%E6%97%A5', {
    waitUntil: 'domcontentloaded',
  })

  const article = page.locator('article').first()
  await expect(article).toBeVisible()
  await expect(page.getByRole('link', { name: 'Next' })).toBeVisible()

  const before = await article.boundingBox()
  await page.getByRole('link', { name: 'Next' }).click()

  await expect(page).toHaveURL(/\/(?:ja-JP\/)?search\?query=.*page=2/)
  await expect(page.getByText('No results found.')).toHaveCount(0)
  await expect(article).toBeVisible()
  await expect(firstMojidataResultLink(page)).toBeVisible({
    timeout: 60_000,
  })

  const after = await article.boundingBox()
  expect(before).not.toBeNull()
  expect(after).not.toBeNull()
  expect(after?.height ?? 0).toBeGreaterThan(200)
})

test('server-data search paging works on desktop', async ({ page }) => {
  await page.goto('/ja-JP/search?executionMode=server-data&query=%E6%97%A5', {
    waitUntil: 'domcontentloaded',
  })

  await expect(page.locator('[data-spa="search"]')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Next' })).toBeVisible()

  await page.getByRole('link', { name: 'Next' }).click()

  await expect(page).toHaveURL(
    /\/(?:ja-JP\/)?search\?executionMode=server-data&query=.*page=2|\/(?:ja-JP\/)?search\?query=.*executionMode=server-data&page=2/,
  )
  await expect(page.getByText('No results found.')).toHaveCount(0)
  await expect(firstMojidataResultLink(page)).toBeVisible({
    timeout: 60_000,
  })
})

test('search result glyph images use muted alt fallback styling', async ({
  page,
}) => {
  await page.goto('/ja-JP/search?query=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })

  const image = page.locator('article img').first()
  await expect(image).toBeVisible({ timeout: 60_000 })

  const styles = await image.evaluate((element) => {
    const computed = window.getComputedStyle(element)
    return {
      color: computed.color,
      fontSize: computed.fontSize,
    }
  })

  expect(styles.color).toMatch(/^rgba\(.+,\s0\.42\)$/)
  expect(styles.fontSize).toBe('45px')
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
  await expect(page.getByTestId('mojidata-response')).toHaveCount(1, {
    timeout: 60_000,
  })
  await expect(
    page.getByTestId('mojidata-response').locator('figure').first().locator('figcaption'),
  ).toContainText('U+6F22', {
    timeout: 60_000,
  })
})

test('mojidata client-data reuses cached wasm and DB after reload', async ({
  page,
}, testInfo) => {
  test.skip(
    !['chromium', 'firefox-spa-cache'].includes(testInfo.project.name),
    'asset request counting is only verified in Chromium and Firefox cache project',
  )
  configureSpaCacheTestTimeout(testInfo)
  const loadTimeout = spaCacheLoadTimeout(testInfo.project.name)

  await clearSpaAssetCache(page)

  const firstLoadAssets = collectAssetRequests(page, [
    'sqlite3.wasm',
    'moji.db',
  ])
  await page.goto('/ja-JP/mojidata/%E6%BC%A2?executionMode=client-data', {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.getByTestId('mojidata-response')).toHaveCount(1, {
    timeout: loadTimeout,
  })
  firstLoadAssets.dispose()

  expect(firstLoadAssets.urls.map(assetNameFromUrl)).toEqual(
    expect.arrayContaining(['sqlite3.wasm', 'moji.db']),
  )

  await waitForCachedAsset(page, 'sqlite3.wasm', loadTimeout)
  await waitForCachedAsset(page, 'moji.db', loadTimeout)

  const firstManifest = await readOpfsManifest(page, [
    'mojidata',
    'moji.db.json',
  ])
  expect(firstManifest).not.toBeNull()

  const reloadAssets = collectAssetRequests(page, ['moji.db'])
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('mojidata-response')).toHaveCount(1, {
    timeout: loadTimeout,
  })
  reloadAssets.dispose()

  expect(reloadAssets.urls).toEqual([])
  await expect(
    readOpfsManifest(page, ['mojidata', 'moji.db.json']),
  ).resolves.toEqual(firstManifest)
})

test('canonical mojidata can render client-data mode in browser', async ({
  page,
}) => {
  await page.goto('/ja-JP/mojidata/%E6%BC%A2?executionMode=client-data', {
    waitUntil: 'domcontentloaded',
  })

  await expect(page.locator('[data-spa="mojidata"]')).toHaveCount(1)
  await expect(page.getByTestId('mojidata-response')).toHaveCount(1, {
    timeout: 60_000,
  })
})

test('idsfind-spa renders results in browser', async ({ page }) => {
  page.on('pageerror', (err) => console.log('[pageerror]', err))
  page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()))

  await page.goto('/ja-JP/idsfind-spa', { waitUntil: 'domcontentloaded' })

  const sawWasm = page.waitForRequest((req) =>
    req.url().includes('/assets/sqlite3.wasm'),
  )
  const sawIdsDb = page.waitForRequest((req) =>
    req.url().includes('/assets/idsfind-fts5.db'),
  )
  await page.goto('/ja-JP/idsfind-spa?whole=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })
  await sawWasm
  await sawIdsDb

  await expect(page.locator('[data-spa="idsfind"]')).toHaveCount(1)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/idsfind\?whole=/,
  )
  await expect(firstMojidataResultLink(page)).toBeVisible({
    timeout: 60_000,
  })
  await expect(firstMojidataResultLink(page)).toHaveAttribute(
    'href',
    /\/mojidata\//,
  )
})

test('idsfind client-data reuses cached wasm and DB after reload', async ({
  page,
}, testInfo) => {
  test.skip(
    !['chromium', 'firefox-spa-cache'].includes(testInfo.project.name),
    'asset request counting is only verified in Chromium and Firefox cache project',
  )
  configureSpaCacheTestTimeout(testInfo)
  const loadTimeout = spaCacheLoadTimeout(testInfo.project.name)

  await clearSpaAssetCache(page)

  const firstLoadAssets = collectAssetRequests(page, [
    'sqlite3.wasm',
    'idsfind-fts5.db',
  ])
  await page.goto('/ja-JP/idsfind?executionMode=client-data&whole=%E6%BC%A2', {
    waitUntil: 'domcontentloaded',
  })
  await expect(firstMojidataResultLink(page)).toBeVisible({
    timeout: loadTimeout,
  })
  firstLoadAssets.dispose()

  expect(firstLoadAssets.urls.map(assetNameFromUrl)).toEqual(
    expect.arrayContaining(['sqlite3.wasm', 'idsfind-fts5.db']),
  )

  const firstManifest = await readOpfsManifest(page, [
    'mojidata',
    'idsfind.db.json',
  ])
  expect(firstManifest).not.toBeNull()

  const reloadAssets = collectAssetRequests(page, [
    'idsfind-fts5.db',
  ])
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(firstMojidataResultLink(page)).toBeVisible({
    timeout: loadTimeout,
  })
  reloadAssets.dispose()

  expect(reloadAssets.urls).toEqual([])
  await expect(
    readOpfsManifest(page, ['mojidata', 'idsfind.db.json']),
  ).resolves.toEqual(firstManifest)
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
  await expect(firstMojidataResultLink(page)).toBeVisible({
    timeout: 60_000,
  })
})
