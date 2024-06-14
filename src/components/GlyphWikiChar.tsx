import { fetchGlyphWikiSvg } from '@/glyphwiki/fetchGlyphWikiSvg'
import { insertWhiteLayerToGlyphWikiSvg } from '@/glyphwiki/insertWhiteLayerToGlyphWikiSvg'
import { toDataUri } from '@/utils/toDataUri'
import Image from 'next/image'
import { Suspense } from 'react'

export interface GlyphWikiCharProps {
  name: string
  alt: string
  size: number
  bot: boolean
}

export function toGlyphWikiName(s: string) {
  if (s[0] === '&' && s[s.length - 1] === ';') {
    return s
      .slice(1, s.length - 1)
      .toLowerCase()
      .replace(/^uk-/, 'utc-')
  }
  return [...s]
    .map(
      (c) =>
        'u' + c.codePointAt(0)?.toString(16).toLowerCase().padStart(4, '0'),
    )
    .join('-')
}

function LoadingImage(props: GlyphWikiCharProps) {
  const { name, alt } = props
  return (
    <span data-name={name} style={{ color: 'gray' }}>
      {alt}
    </span>
  )
}

async function GlyphWikiImage(props: GlyphWikiCharProps) {
  const { name, alt, size, bot } = props
  if (!name) {
    throw new Error(`Invalid character name: ${name}`)
  }
  if (bot) {
    return <LoadingImage {...props} />
  }
  const { svgImage } = await fetchGlyphWikiSvg(name)
  if (svgImage) {
    return (
      <span data-name={name}>
        <Image
          src={toDataUri(
            insertWhiteLayerToGlyphWikiSvg(svgImage),
            'image/svg+xml',
          )}
          alt={alt ?? name}
          width={size}
          height={size}
        />
      </span>
    )
  } else {
    return <span data-name={name}>{alt}</span>
  }
}

export default function GlyphWikiChar(props: GlyphWikiCharProps) {
  return (
    <Suspense fallback={<LoadingImage {...props} />}>
      <GlyphWikiImage {...props} />
    </Suspense>
  )
}
