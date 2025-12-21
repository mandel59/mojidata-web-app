import { NextResponse, userAgent } from 'next/server'
import type { NextRequest } from 'next/server'
import { resolveAcceptLanguage } from 'resolve-accept-language'
import { botDelayWithInfo } from './botDelay'
import { isLikelyBotUserAgent } from './bot'

const BOT_DELAY_MAX_BEFORE_429_MS = 25_000
const BOT_DELAY_BEFORE_429_MS = 20_000

type SpaRewriteTarget = 'search' | 'idsfind' | 'mojidata'

const SPA_REWRITE_TARGETS_ALL: readonly SpaRewriteTarget[] = [
  'search',
  'idsfind',
  'mojidata',
]

function isFileLikePath(pathname: string) {
  const lastSegment = pathname.split('/').pop() ?? ''
  return lastSegment.includes('.')
}

function isMobileUserAgent(ua: string) {
  return /Mobile|Android|iPhone|iPad|iPod|IEMobile|BlackBerry|Opera Mini/i.test(
    ua,
  )
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

function normalizeSpaRewriteTarget(token: string): SpaRewriteTarget | undefined {
  const t = token.trim().toLowerCase()
  if (!t) return undefined
  if (t === 'search' || t === '/search') return 'search'
  if (t === 'idsfind' || t === '/idsfind') return 'idsfind'
  if (t === 'mojidata' || t === '/mojidata') return 'mojidata'
  return undefined
}

function parseSpaRewriteTargets(
  value: string | undefined,
  defaults: readonly SpaRewriteTarget[],
): Set<SpaRewriteTarget> {
  if (value == null) return new Set(defaults)
  const tokens = value
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
  if (tokens.length === 0) return new Set()
  if (tokens.some((t) => t === 'none')) return new Set()
  if (tokens.some((t) => t === 'all' || t === '*'))
    return new Set(SPA_REWRITE_TARGETS_ALL)
  const out = new Set<SpaRewriteTarget>()
  for (const token of tokens) {
    const k = normalizeSpaRewriteTarget(token)
    if (k) out.add(k)
  }
  return out
}

function getSpaRewriteConfig() {
  const g = globalThis as unknown as {
    __spaRewriteConfig?: {
      desktop: Set<SpaRewriteTarget>
      mobile: Set<SpaRewriteTarget>
      bot: Set<SpaRewriteTarget>
    }
  }
  g.__spaRewriteConfig ??= {
    desktop: parseSpaRewriteTargets(
      process.env.SPA_REWRITE_DESKTOP,
      SPA_REWRITE_TARGETS_ALL,
    ),
    mobile: parseSpaRewriteTargets(process.env.SPA_REWRITE_MOBILE, []),
    bot: parseSpaRewriteTargets(process.env.SPA_REWRITE_BOT, SPA_REWRITE_TARGETS_ALL),
  }
  return g.__spaRewriteConfig
}

function getSpaPathForTargets(
  pathnameWithoutLocale: string,
  targets: Set<SpaRewriteTarget>,
) {
  if (pathnameWithoutLocale === '/search' && targets.has('search')) {
    return '/search-spa'
  }
  if (pathnameWithoutLocale === '/idsfind' && targets.has('idsfind')) {
    return '/idsfind-spa'
  }
  const m = pathnameWithoutLocale.match(/^\/mojidata\/([^/]+)$/)
  if (m && targets.has('mojidata')) {
    return `/mojidata-spa/${m[1]}`
  }
  return undefined
}

export async function proxy(
  request: NextRequest,
): Promise<NextResponse | undefined> {
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
  const { isBot, ua } = userAgent(request)
  const isLikelyBot = isLikelyBotUserAgent(ua)
  const pathname2 = stripLocale(url.pathname, getLocaleFromUrl(url))

  const uaKind: 'bot' | 'mobile' | 'desktop' =
    isBot || isLikelyBot ? 'bot' : isMobileUserAgent(ua) ? 'mobile' : 'desktop'
  const spaTargets = getSpaRewriteConfig()[uaKind]
  const spaPath = getSpaPathForTargets(pathname2, spaTargets)
  if (spaPath) {
    const lang = getLocaleFromUrl(url)
    if (lang) {
      url.pathname = `/${lang}${spaPath}`
    }
  }

  if (
    (isBot || isLikelyBot) &&
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
