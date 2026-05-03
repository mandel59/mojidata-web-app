const RELEASE_ASSET_CACHE_CONTROL = 'public, max-age=31536000, immutable'
const LEGACY_ASSET_CACHE_CONTROL = 'public, max-age=300, must-revalidate'
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers':
    'Accept-Encoding, If-Modified-Since, If-None-Match, Range',
  'Access-Control-Max-Age': '86400',
}

type AssetWorkerEnv = {
  MOJIDATA_SPA_ASSET_ORIGIN: string
}

type Asset = {
  name: string
  contentEncodingVariants?: {
    br?: string
  }
  disableDbCompressionForWebKit?: boolean
}

type ResolvedAsset = {
  asset: Asset
  cacheControl: string
  rawPath: string
  brPath?: string
}

const ASSETS = new Map<string, Asset>([
  [
    'sql-wasm.wasm',
    {
      name: 'sql-wasm.wasm',
      contentEncodingVariants: { br: 'sql-wasm.wasm.br' },
    },
  ],
  [
    'sqlite3.wasm',
    {
      name: 'sqlite3.wasm',
      contentEncodingVariants: { br: 'sqlite3.wasm.br' },
    },
  ],
  [
    'moji.db',
    {
      name: 'moji.db',
      contentEncodingVariants: { br: 'moji.db.br' },
      disableDbCompressionForWebKit: true,
    },
  ],
  [
    'idsfind.db',
    {
      name: 'idsfind.db',
      contentEncodingVariants: { br: 'idsfind.db.br' },
      disableDbCompressionForWebKit: true,
    },
  ],
  [
    'idsfind-fts5.db',
    {
      name: 'idsfind-fts5.db',
      contentEncodingVariants: { br: 'idsfind-fts5.db.br' },
      disableDbCompressionForWebKit: true,
    },
  ],
])

function isWebKitSafariUserAgent(ua: string) {
  const s = ua.toLowerCase()
  return (
    s.includes('applewebkit') &&
    s.includes('safari') &&
    !s.includes('chrome') &&
    !s.includes('chromium') &&
    !s.includes('crios') &&
    !s.includes('fxios') &&
    !s.includes('edgios')
  )
}

function shouldUseBrotli(request: Request, asset: Asset) {
  const ua = request.headers.get('user-agent') ?? ''
  if (asset.disableDbCompressionForWebKit && isWebKitSafariUserAgent(ua)) {
    return false
  }

  const acceptEncoding = request.headers.get('accept-encoding')?.toLowerCase()
  return Boolean(asset.contentEncodingVariants?.br && acceptEncoding?.includes('br'))
}

function pathJoin(...segments: string[]) {
  return `/${segments
    .map((segment) => segment.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/')}`
}

function assetAtPrefix(prefix: string, asset: Asset, cacheControl: string) {
  return {
    asset,
    cacheControl,
    rawPath: pathJoin(prefix, asset.name),
    brPath: asset.contentEncodingVariants?.br
      ? pathJoin(prefix, asset.contentEncodingVariants.br)
      : undefined,
  }
}

function resolveAsset(pathname: string): ResolvedAsset | undefined {
  const legacyMatch = pathname.match(/^\/assets\/([^/]+)$/)
  if (legacyMatch) {
    const asset = ASSETS.get(legacyMatch[1])
    if (!asset) return undefined
    return assetAtPrefix('/assets', asset, LEGACY_ASSET_CACHE_CONTROL)
  }

  const releaseMatch = pathname.match(
    /^\/releases\/([A-Za-z0-9._-]+)\/assets\/([^/]+)$/,
  )
  if (!releaseMatch) return undefined

  const asset = ASSETS.get(releaseMatch[2])
  if (!asset) return undefined
  return assetAtPrefix(
    `/releases/${releaseMatch[1]}/assets`,
    asset,
    RELEASE_ASSET_CACHE_CONTROL,
  )
}

function varyHeader(asset: Asset) {
  return asset.disableDbCompressionForWebKit
    ? 'Accept-Encoding, User-Agent'
    : 'Accept-Encoding'
}

function targetUrl(
  request: Request,
  env: AssetWorkerEnv,
  resolved: ResolvedAsset,
) {
  const requestUrl = new URL(request.url)
  const origin = env.MOJIDATA_SPA_ASSET_ORIGIN.replace(/\/+$/, '')
  const path = shouldUseBrotli(request, resolved.asset)
    ? resolved.brPath
    : resolved.rawPath
  const target = new URL(`${origin}${path}`)
  target.search = requestUrl.search
  return target
}

function redirectResponse(location: URL, resolved: ResolvedAsset) {
  return new Response(null, {
    status: 307,
    headers: {
      ...CORS_HEADERS,
      'Cache-Control': resolved.cacheControl,
      Location: location.href,
      Vary: varyHeader(resolved.asset),
    },
  })
}

function notFound() {
  return new Response('Not found', {
    status: 404,
    headers: {
      ...CORS_HEADERS,
      'Cache-Control': 'public, max-age=60',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

function methodNotAllowed() {
  return new Response('Method not allowed', {
    status: 405,
    headers: {
      ...CORS_HEADERS,
      Allow: 'GET, HEAD, OPTIONS',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      })
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return methodNotAllowed()
    }

    const url = new URL(request.url)
    const asset = resolveAsset(url.pathname)
    if (!asset) return notFound()

    return redirectResponse(targetUrl(request, env, asset), asset)
  },
} satisfies ExportedHandler<AssetWorkerEnv>
