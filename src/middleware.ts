import { NextResponse, userAgent } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest): NextResponse | undefined {
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
  const { isBot } = userAgent(request)
  if (isBot) {
    const url = request.nextUrl
    url.searchParams.set('bot', '1')
    return NextResponse.rewrite(url)
  }
}
