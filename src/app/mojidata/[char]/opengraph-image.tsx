/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import { ImageResponse } from 'next/server'

import { Props } from './props'
import {
  fetchGlyphWikiSvg,
  toGlyphWikiName,
} from '@/glyphwiki/fetchGlyphWikiSvg'
import { getRevalidateDuration } from '@/app/config'

export const runtime = 'edge'

export const revalidate = getRevalidateDuration()

export default async function og({ params }: Props) {
  const char = params.char
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
  const { svgImageDataUri } = await fetchGlyphWikiSvg(toGlyphWikiName(ucs))
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: '32px',
        }}
      >
        <div style={{ display: 'flex', fontSize: '128px' }}>U+{codePoint}</div>
        {svgImageDataUri ? (
          <img width={512} height={512} src={svgImageDataUri} />
        ) : (
          <div
            style={{
              display: 'flex',
              fontSize: '512px',
            }}
          >
            {ucs}
          </div>
        )}
      </div>
    ),
    {},
  )
}
