'use client'

import { toGlyphWikiName } from '@/glyphwiki/toGlyphWikiName'

export interface GlyphWikiCharImgProps {
  char: string
  size: number
  alt?: string
}

export default function GlyphWikiCharImg(props: GlyphWikiCharImgProps) {
  const { char, size, alt } = props
  const name = toGlyphWikiName(char)
  const src = `/api/glyphwiki/svg/${encodeURIComponent(name)}`
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      alt={alt ?? char}
    />
  )
}
