const SPA_ASSET_VERSION = process.env.NEXT_PUBLIC_SPA_ASSET_VERSION ?? ''

function withAssetVersion(pathname: string) {
  if (!SPA_ASSET_VERSION) return pathname
  const u = new URL(pathname, 'http://mojidata.local')
  u.searchParams.set('v', SPA_ASSET_VERSION)
  return u.pathname + u.search
}

export const mojidataApiAssets = {
  sqlWasmUrl: withAssetVersion('/assets/sql-wasm.wasm'),
  mojidataDbUrl: withAssetVersion('/assets/moji.db'),
  idsfindDbUrl: withAssetVersion('/assets/idsfind.db'),
}

