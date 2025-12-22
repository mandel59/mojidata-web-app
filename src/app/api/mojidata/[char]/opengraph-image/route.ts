import { ImageResponse } from 'next/og'

import { fetchGlyphWikiSvg, toGlyphWikiName } from '@/glyphwiki/fetchGlyphWikiSvg'
import { renderMojidataOgImage } from './view'

export const runtime = 'nodejs'

const REVALIDATE_SECONDS = 86400
export const revalidate = 86400

function cacheControl() {
  if (process.env.NODE_ENV === 'development') {
    return 'no-cache, no-store'
  }
  const staleSeconds = 7 * REVALIDATE_SECONDS
  return `public, max-age=0, s-maxage=${REVALIDATE_SECONDS}, must-revalidate, stale-while-revalidate=${staleSeconds}`
}

export async function GET(
  request: Request,
  context: { params: Promise<{ char: string }> },
) {
  const char = (await context.params).char
    // Workaround for a bug in Next.js to replace %25 with %.
    .replace(/%25/g, '%')
  const ucs = String.fromCodePoint(decodeURIComponent(char).codePointAt(0) ?? 0)
  if (ucs <= '\x7f') {
    return new Response('Not Found', { status: 404 })
  }
  const codePoint = ucs
    .codePointAt(0)
    ?.toString(16)
    .toUpperCase()
    .padStart(4, '0')
  const { svgImage } = await fetchGlyphWikiSvg(toGlyphWikiName(ucs))

  return new ImageResponse(
    renderMojidataOgImage({ codePoint, ucs, svgImage }),
    {
      headers: {
        'Cache-Control': cacheControl(),
      },
    },
  )
}
