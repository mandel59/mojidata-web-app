import { getRevalidateDuration } from '@/app/config'
import { customFetch } from '@/customFetch'
import { insertWhiteLayerToGlyphWikiSvg } from '@/glyphwiki/insertWhiteLayerToGlyphWikiSvg'
import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'

export const runtime = 'nodejs'

const REVALIDATE_SECONDS = getRevalidateDuration()

function isValidGlyphWikiName(name: string) {
  return /^([a-z][a-z0-9-]{1,59}_)?[a-z][a-z0-9-]{4,59}(@[1-9][0-9]*)?$/i.test(
    name,
  )
}

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
  const { name } = await context.params
  if (!isValidGlyphWikiName(name)) {
    return new NextResponse('Bad Request', { status: 400 })
  }

  const url = `https://glyphwiki.org/glyph/${encodeURIComponent(name)}.svg`
  const upstream = await customFetch(url, {
    next: {
      revalidate: REVALIDATE_SECONDS,
    },
  })

  if (!upstream.ok) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    })
  }

  const svg = insertWhiteLayerToGlyphWikiSvg(await upstream.text())
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
