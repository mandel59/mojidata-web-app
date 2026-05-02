import { NextResponse, userAgent } from 'next/server'
import type { NextRequest } from 'next/server'
import { resolveAcceptLanguage } from 'resolve-accept-language'
import { botDelayWithInfo } from './botDelay'
import { botFamily, isLikelyBotUserAgent } from './bot'
import {
  isMajorIndexingBotFamily,
  resolveExecutionMode,
} from './deliveryPolicy'

const BOT_DELAY_MAX_BEFORE_429_MS = 25_000
const BOT_DELAY_BEFORE_429_MS = 20_000
const CRAWL_SPA_DEFAULT_BASE_URL = 'https://mojidata-crawl.pages.dev'

const CRAWL_SPA_REDIRECT_BOT_FAMILIES = new Set([
  'ahrefsbot',
  'amazonbot',
  'backlinksextendedbot',
  'claudebot',
  'coccocbot',
  'dotbot',
  'gptbot',
  'mj12bot',
  'petalbot',
  'semrushbot',
  'seznambot',
  'yandexbot',
])

const SPA_ASSET_CACHE_CONTROL =
  process.env.NODE_ENV === 'production'
    ? 'public, max-age=31536000, immutable'
    : 'public, max-age=0, must-revalidate'

const COMPRESSIBLE_SPA_ASSETS = new Set([
  '/assets/sql-wasm.wasm',
  '/assets/sqlite3.wasm',
  '/assets/moji.db',
  '/assets/idsfind.db',
  '/assets/idsfind-fts5.db',
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

function pickAssetCompressionForUserAgent(
  acceptEncoding: string | null,
  ua: string,
) {
  const v = (acceptEncoding ?? '').toLowerCase()
  if (isWebKitSafariUserAgent(ua)) {
    if (v.includes('gzip')) return 'gzip'
    if (v.includes('br')) return 'br'
    return undefined
  }
  if (v.includes('br')) return 'br'
  if (v.includes('gzip')) return 'gzip'
  return undefined
}

function isFileLikePath(pathname: string) {
  const lastSegment = pathname.split('/').pop() ?? ''
  return lastSegment.includes('.')
}

function getLocaleFromUrl(url: URL): string | undefined {
  const locale = url.pathname.split('/')[1]
  if (locale.match(/^[a-z]{2}-[A-Z]{2}$/)) {
    return locale
  }
  return undefined
}

function stripLocale(pathname: string, locale: string | undefined) {
  if (!locale) return pathname
  const prefix = `/${locale}`
  return pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname
}

function getCrawlSpaBaseUrl() {
  const raw =
    process.env.CRAWL_SPA_REDIRECT_BASE_URL?.trim() ??
    CRAWL_SPA_DEFAULT_BASE_URL
  try {
    return new URL(raw)
  } catch {
    return undefined
  }
}

function getPathnameWithoutLocale(pathname: string) {
  const locale = getLocaleFromUrl(new URL(`https://mojidata.local${pathname}`))
  return stripLocale(pathname, locale) || '/'
}

function isCrawlSpaRoute(pathname: string) {
  const p = getPathnameWithoutLocale(pathname)
  return (
    p === '/' ||
    p === '/search' ||
    p === '/search-spa' ||
    p === '/idsfind' ||
    p === '/idsfind-spa' ||
    p.startsWith('/mojidata/') ||
    p.startsWith('/mojidata-spa/')
  )
}

function shouldRedirectToCrawlSpa(request: NextRequest, family: string) {
  if (process.env.CRAWL_SPA_REDIRECT_DISABLE === '1') return false
  if (request.method !== 'GET' && request.method !== 'HEAD') return false
  if (isMajorIndexingBotFamily(family)) return false
  if (!CRAWL_SPA_REDIRECT_BOT_FAMILIES.has(family)) return false

  const pathname = request.nextUrl.pathname
  return (
    isCrawlSpaRoute(pathname) &&
    !pathname.startsWith('/_next/') &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/assets/') &&
    !isFileLikePath(pathname)
  )
}

function redirectToCrawlSpa(request: NextRequest) {
  const baseUrl = getCrawlSpaBaseUrl()
  if (!baseUrl) return undefined

  const target = new URL(baseUrl)
  target.pathname = request.nextUrl.pathname
  target.search = request.nextUrl.search
  target.hash = ''

  const res = NextResponse.redirect(target, 307)
  res.headers.set('Cache-Control', 'private, no-store')
  res.headers.set('Vary', 'User-Agent')
  return res
}

function getExecutionModeOverride(
  url: URL,
): 'server-data' | 'client-data' | undefined {
  const value = url.searchParams.getAll('executionMode').find(
    (candidate) =>
      candidate === 'server-data' || candidate === 'client-data',
  )
  return value
}

export async function middleware(
  request: NextRequest,
): Promise<NextResponse | undefined> {
  const { isBot, ua } = userAgent(request)
  const family = botFamily(ua)
  if (COMPRESSIBLE_SPA_ASSETS.has(request.nextUrl.pathname)) {
    if (
      isWebKitSafariUserAgent(ua) &&
      (request.nextUrl.pathname === '/assets/moji.db' ||
        request.nextUrl.pathname === '/assets/idsfind.db' ||
        request.nextUrl.pathname === '/assets/idsfind-fts5.db')
    ) {
      // WebKit/Safari does not reliably decode Content-Encoding for large
      // application/octet-stream fetches, which breaks sql.js DB loading.
      // Serve the uncompressed DB for these user agents.
      return
    }
    const encoding = pickAssetCompressionForUserAgent(
      request.headers.get('accept-encoding'),
      ua,
    )
    const ext = encoding === 'br' ? '.br' : encoding === 'gzip' ? '.gz' : undefined
    if (encoding && ext) {
      const assetUrl = new URL(request.url)
      assetUrl.pathname = `${request.nextUrl.pathname}${ext}`
      const res = NextResponse.redirect(assetUrl, 307)
      res.headers.set('Vary', 'Accept-Encoding')
      res.headers.set('Cache-Control', SPA_ASSET_CACHE_CONTROL)
      return res
    }
  }

  if (shouldRedirectToCrawlSpa(request, family)) {
    return redirectToCrawlSpa(request)
  }

  const locale = getLocaleFromUrl(request.nextUrl)
  let url = request.nextUrl
  const url0 = String(url)
  if (
    !url.pathname.startsWith('/_') &&
    !url.pathname.startsWith('/api/') &&
    !url.pathname.startsWith('/assets/') &&
    !isFileLikePath(url.pathname) &&
    !/^\/[a-z]{2}-[A-Z]{2}\//.test(url.pathname)
  ) {
    const acceptLanguage = request.headers.get('accept-language')
    const lang = resolveAcceptLanguage(
      acceptLanguage || 'en-US',
      ['en-US', 'ja-JP'],
      'en-US',
    )
    url.pathname = `/${lang}${url.pathname}`
  }
  const locale2 = getLocaleFromUrl(url)
  const pathname = stripLocale(url.pathname, locale2)

  const ogImageMatch = pathname.match(/^\/mojidata\/([^/]+)\/opengraph-image$/)
  if (ogImageMatch) {
    url.pathname = `/api/mojidata/${ogImageMatch[1]}/opengraph-image`
    return NextResponse.rewrite(url)
  }

  if (pathname.startsWith('/mojidata/')) {
    // redirect /mojidata/U+6F22 to /mojidata/漢
    const m = pathname.match(/^\/mojidata\/[uU](?:\+|%2B)?([0-9a-fA-F]{4,6})$/)
    if (m) {
      const codePoint = m[1]
      try {
        const char = String.fromCodePoint(parseInt(codePoint, 16))
        if (locale) {
          return NextResponse.redirect(
            new URL(
              `/${locale}/mojidata/${encodeURIComponent(char)}`,
              request.url,
            ),
          )
        }
        return NextResponse.redirect(
          new URL(`/mojidata/${encodeURIComponent(char)}`, request.url),
        )
      } catch (e) {
        return new NextResponse(`Invalid code point: ${codePoint}`, {
          status: 400,
        })
      }
    }
  }
  const isLikelyBot = isLikelyBotUserAgent(ua)
  const pathname2 = stripLocale(url.pathname, getLocaleFromUrl(url))
  const executionModeOverride = getExecutionModeOverride(url)
  const { isMajorIndexingBot, internalClientDataPath } = resolveExecutionMode({
    pathnameWithoutLocale: pathname2,
    ua,
    isBot,
    isLikelyBot,
    family,
  })

  if (
    executionModeOverride !== 'server-data' &&
    (executionModeOverride === 'client-data' || internalClientDataPath)
  ) {
    const locale3 = getLocaleFromUrl(url)
    if (internalClientDataPath) {
      url.pathname = locale3
        ? `/${locale3}${internalClientDataPath}`
        : internalClientDataPath
    }
  }

  if (
    (isBot || isLikelyBot) &&
    !isMajorIndexingBot &&
    !url.pathname.startsWith('/_next/') &&
    !url.pathname.startsWith('/assets/') &&
    !url.pathname.startsWith('/api/') &&
    !isFileLikePath(url.pathname)
  ) {
    if (!isBot) {
      url.searchParams.set('disableExternalLinks', '1')
    }
    url.searchParams.set('bot', '1')
    if (process.env.BOT_DELAY_DISABLE !== '1') {
      const { delayMs, info } = botDelayWithInfo(request, ua)
      if (process.env.BOT_DELAY_DEBUG === '1') {
        console.log('[botDelay]', {
          ua,
          isBot,
          isLikelyBot,
          delayMs,
          ...info,
        })
      }
      if (delayMs > BOT_DELAY_MAX_BEFORE_429_MS) {
        await new Promise((resolve) =>
          setTimeout(resolve, BOT_DELAY_BEFORE_429_MS),
        )
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'retry-after': String(Math.ceil(BOT_DELAY_BEFORE_429_MS / 1000)),
            'content-type': 'text/plain; charset=utf-8',
          },
        })
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
  const url1 = String(url)
  if (url0 !== url1) {
    return NextResponse.rewrite(url)
  }
}
