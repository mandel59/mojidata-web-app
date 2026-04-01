export interface DeferredCharSvgImageViewProps {
  char: string
  size: number
  alt?: string
  source: 'glyphwiki' | 'ipamjm'
  loaded: boolean
  renderImage: boolean
  imageSrc: string
  onImageLoad?: () => void
}

export default function DeferredCharSvgImageView(
  props: DeferredCharSvgImageViewProps,
) {
  const { char, size, alt, source, loaded, renderImage, imageSrc, onImageLoad } =
    props

  return (
    <span
      className="mojidata-deferred-char-image"
      data-loaded={loaded ? 'true' : 'false'}
      style={{ width: size, height: size }}
    >
      <span
        className={`mojidata-deferred-char-image__fallback mojidata-raw-char${
          source === 'ipamjm' ? ' mojidata-mojijoho' : ''
        }`}
        aria-hidden={loaded}
      >
        {char}
      </span>
      {renderImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          alt={alt ?? char}
          className="mojidata-deferred-char-image__img"
          onLoad={onImageLoad}
        />
      ) : null}
    </span>
  )
}
