import { NextResponse, userAgent } from 'next/server'
import type { NextRequest } from 'next/server'
import { resolveAcceptLanguage } from 'resolve-accept-language'
import { botDelayWithInfo } from './botDelay'

const BOT_DELAY_MAX_BEFORE_429_MS = 25_000
const BOT_DELAY_BEFORE_429_MS = 20_000

function isLikelyBotUserAgent(ua: string): boolean {
  const s = ua.toLowerCase()
  if (!s) return false
  return (
    s.includes('gptbot') ||
    s.includes('oai-searchbot') ||
    s.includes('amazonbot') ||
    s.includes('ahrefsbot') ||
    s.includes('semrushbot') ||
    s.includes('mj12bot') ||
    s.includes('dotbot') ||
    s.includes('petalbot') ||
    s.includes('bytespider') ||
    s.includes('baiduspider') ||
    s.includes('yisouspider') ||
    s.includes('seznambot') ||
    s.includes('coccocbot') ||
    s.includes('backlinksextendedbot') ||
    /(?:\b(?:bot|spider|crawler|crawl|slurp|archiver)\b)/i.test(ua)
  )
}

function getLocaleFromUrl(url: URL): string | undefined {
  const locale = url.pathname.split('/')[1]
  if (locale.match(/^[a-z]{2}-[A-Z]{2}$/)) {
    return locale
  }
  return undefined
}

export async function middleware(
  request: NextRequest,
): Promise<NextResponse | undefined> {
  const locale = getLocaleFromUrl(request.nextUrl)
  let url = request.nextUrl
  const url0 = String(url)
  if (
    !url.pathname.startsWith('/_') &&
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
  const pathname = url.pathname.slice('/en-US'.length)
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
  const isBytespider = ua.includes('Bytespider')
  const isGPTBot = ua.includes('GPTBot')
  const isLikelyBot = isLikelyBotUserAgent(ua)
  if (isBot || isBytespider || isGPTBot || isLikelyBot) {
    if (isBytespider) {
      url.searchParams.set('disableExternalLinks', '1')
    }
    url.searchParams.set('bot', '1')
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
      await new Promise((resolve) => setTimeout(resolve, BOT_DELAY_BEFORE_429_MS))
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
  const url1 = String(url)
  if (url0 !== url1) {
    return NextResponse.rewrite(url)
  }
}
