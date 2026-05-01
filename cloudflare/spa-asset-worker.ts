const CACHE_CONTROL = 'public, max-age=31536000, immutable'
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
  rawPath: string
  brPath?: string
  disableDbCompressionForWebKit?: boolean
}

const ASSETS = new Map<string, Asset>([
  [
    '/assets/sql-wasm.wasm',
    {
      rawPath: '/assets/sql-wasm.wasm',
      brPath: '/assets/sql-wasm.wasm.br',
    },
  ],
  [
    '/assets/moji.db',
    {
      rawPath: '/assets/moji.db',
      brPath: '/assets/moji.db.br',
      disableDbCompressionForWebKit: true,
    },
  ],
  [
    '/assets/idsfind.db',
    {
      rawPath: '/assets/idsfind.db',
      brPath: '/assets/idsfind.db.br',
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
  return Boolean(asset.brPath && acceptEncoding?.includes('br'))
}

function targetUrl(request: Request, env: AssetWorkerEnv, asset: Asset) {
  const requestUrl = new URL(request.url)
  const origin = env.MOJIDATA_SPA_ASSET_ORIGIN.replace(/\/+$/, '')
  const path = shouldUseBrotli(request, asset) ? asset.brPath : asset.rawPath
  const target = new URL(`${origin}${path}`)
  target.search = requestUrl.search
  return target
}

function redirectResponse(location: URL) {
  return new Response(null, {
    status: 307,
    headers: {
      ...CORS_HEADERS,
      'Cache-Control': CACHE_CONTROL,
      Location: location.href,
      Vary: 'Accept-Encoding',
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
    const asset = ASSETS.get(url.pathname)
    if (!asset) return notFound()

    return redirectResponse(targetUrl(request, env, asset))
  },
} satisfies ExportedHandler<AssetWorkerEnv>
