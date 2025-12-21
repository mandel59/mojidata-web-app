import { fetchGlyphWikiSvg } from '@/glyphwiki/fetchGlyphWikiSvg'
import { insertWhiteLayerToGlyphWikiSvg } from '@/glyphwiki/insertWhiteLayerToGlyphWikiSvg'
import { toGlyphWikiName } from '@/glyphwiki/toGlyphWikiName'
import { toDataUri } from '@/utils/toDataUri'
import Image from 'next/image'
import { Suspense } from 'react'

export interface GlyphWikiCharProps {
  name: string
  alt: string
  size: number
  bot: boolean
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
