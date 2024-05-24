import { NextResponse, userAgent } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(
  request: NextRequest,
): Promise<NextResponse | undefined> {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/mojidata/')) {
    // redirect /mojidata/U+6F22 to /mojidata/漢
    const m = pathname.match(/^\/mojidata\/[uU](?:\+|%2B)?([0-9a-fA-F]{4,6})$/)
    if (m) {
      const codePoint = m[1]
      try {
        const char = String.fromCodePoint(parseInt(codePoint, 16))
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
  if (isBot || ua.includes('Bytespider')) {
    if (ua.includes('Bytespider')) {
      if (Math.random() < 0.75) {
        // Request too many. Randomly return 429.
        return new NextResponse('', { status: 429 })
      }
    }
    if (request.nextUrl.host !== 'mojidata.ryusei.dev') {
      const url = request.nextUrl
      url.host = 'mojidata.ryusei.dev'
      return NextResponse.redirect(url)
    } else {
      const url = request.nextUrl
      url.searchParams.set('bot', '1')
      return NextResponse.rewrite(url)
    }
  }
}
