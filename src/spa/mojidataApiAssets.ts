const SPA_ASSET_VERSION = process.env.NEXT_PUBLIC_SPA_ASSET_VERSION ?? ''
const SPA_ASSET_BASE_URL =
  process.env.NEXT_PUBLIC_SPA_ASSET_BASE_URL?.trim() ?? ''

function isAbsoluteUrl(value: string) {
  return /^[a-z][a-z0-9+.-]*:/i.test(value)
}

function withAssetVersion(assetUrl: string) {
  if (!SPA_ASSET_VERSION) return assetUrl
  const u = new URL(assetUrl, 'http://mojidata.local')
  u.searchParams.set('v', SPA_ASSET_VERSION)
  return isAbsoluteUrl(assetUrl) ? u.href : u.pathname + u.search
}

function releaseFromAssetBaseUrl() {
  if (!SPA_ASSET_BASE_URL) return ''
  try {
    const pathname = new URL(SPA_ASSET_BASE_URL, 'http://mojidata.local')
      .pathname
    const match = pathname.match(/(?:^|\/)releases\/([^/]+)(?:\/|$)/)
    return match?.[1] ?? ''
  } catch {
    return ''
  }
}

function opfsSafeReleaseKey(value: string) {
  return value.trim().replace(/[^A-Za-z0-9._-]+/g, '_')
}

function resolveAssetUrl(pathname: string, overrideUrl?: string) {
  const trimmedOverride = overrideUrl?.trim()
  if (trimmedOverride) return withAssetVersion(trimmedOverride)
  if (!SPA_ASSET_BASE_URL) return withAssetVersion(pathname)

  const base = SPA_ASSET_BASE_URL.replace(/\/+$/, '')
  if (base.endsWith('/assets') && pathname.startsWith('/assets/')) {
    return withAssetVersion(`${base}${pathname.slice('/assets'.length)}`)
  }

  return withAssetVersion(`${base}${pathname}`)
}

const assetVersion = SPA_ASSET_VERSION || releaseFromAssetBaseUrl()

export const mojidataApiAssets = {
  assetVersion,
  opfsReleaseKey: opfsSafeReleaseKey(assetVersion),
  sqlWasmUrl: resolveAssetUrl(
    '/assets/sql-wasm.wasm',
    process.env.NEXT_PUBLIC_SPA_SQL_WASM_URL,
  ),
  sqliteWasmUrl: resolveAssetUrl(
    '/assets/sqlite3.wasm',
    process.env.NEXT_PUBLIC_SPA_SQLITE_WASM_URL,
  ),
  mojidataDbUrl: resolveAssetUrl(
    '/assets/moji.db',
    process.env.NEXT_PUBLIC_SPA_MOJIDATA_DB_URL,
  ),
  idsfindDbUrl: resolveAssetUrl(
    '/assets/idsfind.db',
    process.env.NEXT_PUBLIC_SPA_IDSFIND_DB_URL,
  ),
  idsfindFts5DbUrl: resolveAssetUrl(
    '/assets/idsfind-fts5.db',
    process.env.NEXT_PUBLIC_SPA_IDSFIND_FTS5_DB_URL,
  ),
}
