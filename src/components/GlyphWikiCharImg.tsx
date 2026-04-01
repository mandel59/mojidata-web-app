import { toGlyphWikiName } from '@/glyphwiki/toGlyphWikiName'

export interface GlyphWikiCharImgProps {
  char: string
  size: number
  alt?: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
}

export default function GlyphWikiCharImg(props: GlyphWikiCharImgProps) {
  const { char, size, alt, loading = 'lazy', fetchPriority } = props
  const name = toGlyphWikiName(char)
  const src = `/api/glyphwiki/svg/${encodeURIComponent(name)}`
  return (
    // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        width={size}
        height={size}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        alt={alt ?? char}
      />
  )
}
