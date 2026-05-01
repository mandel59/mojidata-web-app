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

function resolveAssetUrl(pathname: string, overrideUrl?: string) {
  const trimmedOverride = overrideUrl?.trim()
  if (trimmedOverride) return withAssetVersion(trimmedOverride)
  if (!SPA_ASSET_BASE_URL) return withAssetVersion(pathname)

  const base = SPA_ASSET_BASE_URL.replace(/\/+$/, '')
  return withAssetVersion(`${base}${pathname}`)
}

export const mojidataApiAssets = {
  sqlWasmUrl: resolveAssetUrl(
    '/assets/sql-wasm.wasm',
    process.env.NEXT_PUBLIC_SPA_SQL_WASM_URL,
  ),
  mojidataDbUrl: resolveAssetUrl(
    '/assets/moji.db',
    process.env.NEXT_PUBLIC_SPA_MOJIDATA_DB_URL,
  ),
  idsfindDbUrl: resolveAssetUrl(
    '/assets/idsfind.db',
    process.env.NEXT_PUBLIC_SPA_IDSFIND_DB_URL,
  ),
}
