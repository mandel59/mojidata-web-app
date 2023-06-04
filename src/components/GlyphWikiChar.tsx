import { getRevalidateDuration } from '@/app/config'
import { fetchGlyphWikiSvg } from '@/glyphwiki/fetchGlyphWikiSvg'
import Image from 'next/image'

export interface GlyphWikiCharProps {
  name: string
  alt: string
  size: number
}

export function toGlyphWikiName(s: string) {
  return [...s]
    .map(
      (c) =>
        'u' + c.codePointAt(0)?.toString(16).toLowerCase().padStart(4, '0'),
    )
    .join('-')
}

export default async function GlyphWikiChar(props: GlyphWikiCharProps) {
  const { name, alt, size } = props
  if (!name) {
    throw new Error(`Invalid character name: ${name}`)
  }
  const { svgImageDataUri } = await fetchGlyphWikiSvg(name)
  if (svgImageDataUri) {
    return (
      <Image
        src={svgImageDataUri}
        alt={alt ?? name}
        width={size}
        height={size}
      />
    )
  } else {
    return <span data-name={name}>{alt}</span>
  }
}
