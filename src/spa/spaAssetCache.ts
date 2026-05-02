export const SPA_ASSET_CACHE_NAME = 'mojidata-spa-assets-v1'

const managedAssetPathnames = [
  '/assets/sql-wasm.wasm',
  '/assets/sqlite3.wasm',
  '/assets/moji.db',
  '/assets/idsfind.db',
  '/assets/idsfind-fts5.db',
]

const inflightAssetBytes = new Map<string, Promise<ArrayBuffer>>()
const inflightAssetPrefetches = new Map<string, Promise<void>>()

function currentLocationHref() {
  return globalThis.location?.href ?? 'http://mojidata.local/'
}

export function normalizeSpaAssetUrl(assetUrl: string) {
  return new URL(assetUrl, currentLocationHref()).href
}

async function openSpaAssetCache() {
  if (!globalThis.caches) return undefined
  try {
    return await globalThis.caches.open(SPA_ASSET_CACHE_NAME)
  } catch {
    return undefined
  }
}

function isManagedAssetUrl(assetUrl: string) {
  try {
    const { pathname } = new URL(assetUrl)
    return managedAssetPathnames.some((managedPathname) =>
      pathname.endsWith(managedPathname),
    )
  } catch {
    return false
  }
}

function cacheableAssetResponse(source: Response, bytes: ArrayBuffer) {
  const headers = new Headers()
  const contentType = source.headers.get('content-type')
  const cacheControl = source.headers.get('cache-control')
  const etag = source.headers.get('etag')
  const lastModified = source.headers.get('last-modified')
  if (contentType) headers.set('Content-Type', contentType)
  if (cacheControl) headers.set('Cache-Control', cacheControl)
  if (etag) headers.set('ETag', etag)
  if (lastModified) headers.set('Last-Modified', lastModified)
  return new Response(bytes.slice(0), {
    status: source.status,
    statusText: source.statusText,
    headers,
  })
}

async function readSpaAssetBytesFromSource(assetUrl: string) {
  const cache = await openSpaAssetCache()
  const cached = await cache?.match(assetUrl)
  if (cached?.ok) {
    return await cached.arrayBuffer()
  }

  const response = await fetch(assetUrl, { cache: 'force-cache' })
  if (!response.ok) {
    throw new Error(
      `Failed to fetch SPA asset: ${assetUrl} (${response.status} ${response.statusText})`,
    )
  }

  const bytes = await response.arrayBuffer()
  await cache
    ?.put(assetUrl, cacheableAssetResponse(response, bytes))
    .catch(() => undefined)
  return bytes
}

export async function readSpaAssetBytes(assetUrl: string) {
  const normalizedUrl = normalizeSpaAssetUrl(assetUrl)
  const existing = inflightAssetBytes.get(normalizedUrl)
  if (existing) return await existing

  const created = readSpaAssetBytesFromSource(normalizedUrl)
  inflightAssetBytes.set(normalizedUrl, created)
  try {
    return await created
  } finally {
    inflightAssetBytes.delete(normalizedUrl)
  }
}

export async function prefetchSpaAsset(assetUrl: string) {
  const normalizedUrl = normalizeSpaAssetUrl(assetUrl)
  const inflightBytes = inflightAssetBytes.get(normalizedUrl)
  if (inflightBytes) {
    await inflightBytes
    return
  }

  const existing = inflightAssetPrefetches.get(normalizedUrl)
  if (existing) return await existing

  const created = (async () => {
    const cache = await openSpaAssetCache()
    if ((await cache?.match(normalizedUrl))?.ok) return

    const response = await fetch(normalizedUrl, { cache: 'force-cache' })
    if (!response.ok) {
      throw new Error(
        `Failed to fetch SPA asset: ${normalizedUrl} (${response.status} ${response.statusText})`,
      )
    }

    const bytes = await response.arrayBuffer()
    await cache
      ?.put(normalizedUrl, cacheableAssetResponse(response, bytes))
      .catch(() => undefined)
  })()

  inflightAssetPrefetches.set(normalizedUrl, created)
  try {
    await created
  } finally {
    inflightAssetPrefetches.delete(normalizedUrl)
  }
}

export async function pruneStaleSpaAssetCache(activeAssetUrls: string[]) {
  const cache = await openSpaAssetCache()
  if (!cache) return

  const activeUrls = new Set(activeAssetUrls.map(normalizeSpaAssetUrl))
  const requests = await cache.keys()
  await Promise.all(
    requests.map(async (request) => {
      if (!isManagedAssetUrl(request.url)) return
      if (activeUrls.has(request.url)) return
      await cache.delete(request)
    }),
  )
}
