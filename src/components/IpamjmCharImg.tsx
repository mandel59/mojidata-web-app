import { toGlyphWikiName } from '@/glyphwiki/toGlyphWikiName'

export interface IpamjmCharImgProps {
  char: string
  size: number
  alt?: string
}

export default function IpamjmCharImg(props: IpamjmCharImgProps) {
  const { char, size, alt } = props
  const name = toGlyphWikiName(char)
  const src = `/api/ipamjm/svg/${encodeURIComponent(name)}`
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
