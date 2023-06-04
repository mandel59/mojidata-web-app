import { ImageResponse } from 'next/server'

import { Props } from './props'

export const runtime = 'edge'

export const revalidate = 10

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
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', fontSize: '64px' }}>U+{codePoint}</div>
        <div style={{ display: 'flex', fontSize: '256px' }}>{ucs}</div>
      </div>
    ),
    {},
  )
}
