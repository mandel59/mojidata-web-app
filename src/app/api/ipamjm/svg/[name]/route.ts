import { getRevalidateDuration } from '@/app/config'
import { insertWhiteLayerToGlyphWikiSvg } from '@/glyphwiki/insertWhiteLayerToGlyphWikiSvg'
import { renderIpamjmFont } from '@/glyphwiki/renderIpamjmFont'
import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'

export const runtime = 'nodejs'

const REVALIDATE_SECONDS = getRevalidateDuration()
const UNICODE_GLYPH_NAME_PATTERN =
  /^u[0-9a-f]{4,6}(?:-u[0-9a-f]{4,6})?$/i

function cacheControl() {
  if (process.env.NODE_ENV !== 'production') {
    return `public, max-age=0, s-maxage=${REVALIDATE_SECONDS}, must-revalidate`
  }
  const staleSeconds = 7 * REVALIDATE_SECONDS
  return `public, max-age=${REVALIDATE_SECONDS}, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=${staleSeconds}`
}

export async function GET(
  request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const rawName = (await context.params).name
  if (!UNICODE_GLYPH_NAME_PATTERN.test(rawName)) {
    return new NextResponse('Bad Request', { status: 400 })
  }

  const name = rawName.toLowerCase()
  const ipamjmSvg = renderIpamjmFont(name)
  if (ipamjmSvg == null) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const svg = insertWhiteLayerToGlyphWikiSvg(ipamjmSvg)
  const etag = `W/\"${createHash('sha256').update(svg).digest('base64url')}\"`
  const ifNoneMatch = request.headers.get('if-none-match')

  const headers = new Headers()
  headers.set('Content-Type', 'image/svg+xml; charset=utf-8')
  headers.set('Cache-Control', cacheControl())
  headers.set('ETag', etag)

  if (ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304, headers })
  }

  return new NextResponse(svg, { status: 200, headers })
}
