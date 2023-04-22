import { getRevalidateDuration } from '@/app/config'
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
  const svgImageResponse = await fetch(
    `https://glyphwiki.org/glyph/${encodeURIComponent(name)}.svg`,
    {
      next: {
        revalidate: getRevalidateDuration(),
      },
    },
  )
  if (!svgImageResponse.ok) {
    // Failed to fetch SVG image. Fall back to the character.
    return <span data-name={name}>{alt}</span>
  }
  const svgImage = await svgImageResponse.text()
  const svgImageDataUri = `data:image/svg+xml,${encodeURIComponent(svgImage)}`
  return (
    <Image src={svgImageDataUri} alt={alt ?? name} width={size} height={size} />
  )
}
