import { toGlyphWikiName } from '@/glyphwiki/toGlyphWikiName'
import styles from './SvgImageFallback.module.css'

export interface IpamjmCharImgProps {
  char: string
  size: number
  alt?: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
}

export default function IpamjmCharImg(props: IpamjmCharImgProps) {
  const { char, size, alt, loading = 'lazy', fetchPriority } = props
  const name = toGlyphWikiName(char)
  const src = `/api/ipamjm/svg/${encodeURIComponent(name)}`
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
      className={`${styles.img} ${styles.ipamjm}`}
      style={{
        ['--svg-image-fallback-size' as string]: `${fallbackSize}px`,
      }}
    />
  )
}
