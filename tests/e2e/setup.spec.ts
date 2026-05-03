import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

const assetPaths = [
  '/assets/sql-wasm.wasm',
  '/assets/sqlite3.wasm',
  '/assets/idsfind.db',
  '/assets/idsfind-fts5.db',
  '/assets/moji.db',
]

async function warmGet(
  request: APIRequestContext,
  url: string,
  opts?: { headers?: Record<string, string> },
) {
  let lastStatus: number | null = null
  let lastBody: string | null = null
  for (let i = 0; i < 30; i++) {
    const res = await request.get(url, opts)
    lastStatus = res.status()
    if (lastStatus >= 200 && lastStatus < 300) return
    lastBody = await res.text().catch(() => null)
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(
    `warmGet failed: ${url} (status=${lastStatus ?? 'unknown'})\n${lastBody ?? ''}`,
  )
}

function isLocalBaseUrl(value: string | undefined) {
  if (!value) return true
  try {
    const { hostname } = new URL(value)
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
  } catch {
    return false
  }
}

function resolveAssetWarmupUrls() {
  const assetBaseUrl = process.env.PLAYWRIGHT_TEST_SPA_ASSET_BASE_URL?.trim()
  if (assetBaseUrl) {
    const base = assetBaseUrl.replace(/\/+$/, '')
    return assetPaths.map((pathname) =>
      base.endsWith('/assets') && pathname.startsWith('/assets/')
        ? `${base}${pathname.slice('/assets'.length)}`
        : `${base}${pathname}`,
    )
  }

  if (isLocalBaseUrl(process.env.PLAYWRIGHT_TEST_BASE_URL)) {
    return assetPaths
  }

  return []
}

test('warm up next dev routes', async ({ request }) => {
  await warmGet(request, '/ja-JP/search')
  await warmGet(request, '/ja-JP/idsfind')
  await warmGet(request, '/ja-JP/mojidata/%E6%BC%A2')
  await warmGet(request, '/ja-JP/search-spa')
  await warmGet(request, '/ja-JP/idsfind-spa')
  await warmGet(request, '/ja-JP/mojidata-spa/%E6%BC%A2')
  await warmGet(request, '/api/mojidata/%E6%BC%A2/opengraph-image')

  for (const assetUrl of resolveAssetWarmupUrls()) {
    await warmGet(request, assetUrl, {
      headers: { Range: 'bytes=0-64' },
    })
  }

  expect(true).toBeTruthy()
})
