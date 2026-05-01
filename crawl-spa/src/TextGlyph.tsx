export interface TextGlyphProps {
  char: string
  size?: number
  alt?: string
}

export default function TextGlyph(props: TextGlyphProps) {
  const { char, size, alt } = props
  return (
    <span
      role={alt ? 'img' : undefined}
      aria-label={alt}
      style={{
        display: 'inline-grid',
        minWidth: size ? `${size}px` : undefined,
        minHeight: size ? `${size}px` : undefined,
        placeItems: 'center',
        fontSize: size ? `${Math.max(size - 10, 1)}px` : undefined,
        lineHeight: 1,
      }}
    >
      {char}
    </span>
  )
}
