import { NextResponse, userAgent } from 'next/server'
import type { NextRequest } from 'next/server'
import { resolveAcceptLanguage } from 'resolve-accept-language'

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
  if (isBot || isBytespider) {
    if (isBytespider) {
      if (Math.random() < 0.75) {
        // Request too many. Randomly return 429.
        return new NextResponse('', {
          status: 429,
          headers: { 'Retry-After': '60' },
        })
      }
    }
    if (isBytespider) {
      url.searchParams.set('disableExternalLinks', '1')
    }
    url.searchParams.set('bot', '1')
  }
  const url1 = String(url)
  if (url0 !== url1) {
    return NextResponse.rewrite(url)
  }
}
