/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import { ImageResponse } from 'next/og'

import { Props } from './props'
import {
  fetchGlyphWikiSvg,
  toGlyphWikiName,
} from '@/glyphwiki/fetchGlyphWikiSvg'
import { getRevalidateDuration } from '@/app/config'
import { toDataUri } from '@/utils/toDataUri'

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
  const { svgImage } = await fetchGlyphWikiSvg(toGlyphWikiName(ucs))
  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: 'white',
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
        {svgImage ? (
          <img
            width={512}
            height={512}
            src={toDataUri(svgImage, 'image/svg+xml')}
          />
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
