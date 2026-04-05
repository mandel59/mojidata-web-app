import { toGlyphWikiName } from '@/glyphwiki/toGlyphWikiName'
import styles from './SvgImageFallback.module.css'

export interface GlyphWikiCharImgProps {
  char: string
  size: number
  alt?: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  debugSrc?: string
}

export default function GlyphWikiCharImg(props: GlyphWikiCharImgProps) {
  const {
    char,
    size,
    alt,
    loading = 'lazy',
    fetchPriority,
    debugSrc,
  } = props
  const name = toGlyphWikiName(char)
  const src = debugSrc ?? `/api/glyphwiki/svg/${encodeURIComponent(name)}`
  const fallbackSize = Math.max(size - 10, 1)
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
      className={styles.img}
      style={{
        ['--svg-image-fallback-size' as string]: `${fallbackSize}px`,
      }}
    />
  )
}
