import { createApp } from '@mandel59/mojidata-api/app'
import { createMojidataApiWorkerClient } from '@mandel59/mojidata-api/browser-client'
import type { MojidataResults } from '@/mojidata/mojidataShared'

declare const __MOJIDATA_CRAWL_ASSET_BASE_URL__: string
declare const __MOJIDATA_CRAWL_MOJIDATA_DB_URL__: string
declare const __MOJIDATA_CRAWL_IDSFIND_DB_URL__: string
declare const __MOJIDATA_CRAWL_SQL_WASM_URL__: string
declare const __MOJIDATA_CRAWL_ASSET_VERSION__: string
declare const __MOJIDATA_CRAWL_WORKER_URL__: string

type MojidataApiApp = ReturnType<typeof createApp>

let apiPromise:
  | Promise<{
      app: MojidataApiApp
      terminate: () => void
    }>
  | undefined

function isAbsoluteUrl(value: string) {
  return /^[a-z][a-z0-9+.-]*:/i.test(value)
}

function withAssetVersion(assetUrl: string) {
  if (!__MOJIDATA_CRAWL_ASSET_VERSION__) return assetUrl
  const url = new URL(assetUrl, 'https://mojidata.local')
  url.searchParams.set('v', __MOJIDATA_CRAWL_ASSET_VERSION__)
  return isAbsoluteUrl(assetUrl) ? url.href : url.pathname + url.search
}

function resolveAssetUrl(pathname: string, overrideUrl: string) {
  const trimmedOverride = overrideUrl.trim()
  if (trimmedOverride) return withAssetVersion(trimmedOverride)

  const base = __MOJIDATA_CRAWL_ASSET_BASE_URL__.replace(/\/+$/, '')
  if (!base) return withAssetVersion(pathname)
  if (base.endsWith('/assets') && pathname.startsWith('/assets/')) {
    return withAssetVersion(`${base}${pathname.slice('/assets'.length)}`)
  }
  return withAssetVersion(`${base}${pathname}`)
}

const mojidataApiAssets = {
  sqlWasmUrl: resolveAssetUrl(
    '/assets/sql-wasm.wasm',
    __MOJIDATA_CRAWL_SQL_WASM_URL__,
  ),
  mojidataDbUrl: resolveAssetUrl(
    '/assets/moji.db',
    __MOJIDATA_CRAWL_MOJIDATA_DB_URL__,
  ),
  idsfindDbUrl: resolveAssetUrl(
    '/assets/idsfind.db',
    __MOJIDATA_CRAWL_IDSFIND_DB_URL__,
  ),
}

export async function getMojidataApiBrowser() {
  apiPromise ??= (async () => {
    const worker = new Worker(
      new URL(__MOJIDATA_CRAWL_WORKER_URL__, window.location.href),
    )
    const db = createMojidataApiWorkerClient(worker, mojidataApiAssets)
    await db.ready
    const app = createApp(db)
    return { app, terminate: () => db.terminate() }
  })()
  return await apiPromise
}

export async function mojidataBrowser(char: string) {
  const { app } = await getMojidataApiBrowser()
  const url = new URL('/api/v1/mojidata', 'https://mojidata.local')
  url.searchParams.set('char', char)
  const res = await app.fetch(
    new Request(url, {
      headers: { Accept: 'application/json' },
    }),
  )
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
  }
  const body = (await res.json()) as { results: unknown | null }
  if (!body.results) {
    throw new Error(`No results for char: ${char}`)
  }
  return body.results as MojidataResults
}

export async function idsfindBrowserAllResults(params: {
  ids: string[]
  whole: string[]
  ps: string[]
  qs: string[]
}) {
  const { app } = await getMojidataApiBrowser()
  const url = new URL('/api/v1/idsfind', 'https://mojidata.local')
  params.ids.forEach((value) => url.searchParams.append('ids', value))
  params.whole.forEach((value) => url.searchParams.append('whole', value))
  params.ps.forEach((p) => url.searchParams.append('p', p))
  params.qs.forEach((q) => url.searchParams.append('q', q))
  url.searchParams.set('all_results', '')

  const res = await app.fetch(
    new Request(url, {
      headers: { Accept: 'application/json' },
    }),
  )
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
  }
  const body = (await res.json()) as { results: string[]; total?: number }
  return { results: body.results, total: body.total ?? body.results.length }
}
