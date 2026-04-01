import { forwardRef } from 'react'
import styles from './DeferredCharSvgImageView.module.css'

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

const DeferredCharSvgImageView = forwardRef<
  HTMLSpanElement,
  DeferredCharSvgImageViewProps
>(function DeferredCharSvgImageView(props, ref) {
  const {
    char,
    size,
    alt,
    source,
    loaded,
    renderImage,
    imageSrc,
    onImageLoad,
  } = props
  const fallbackSize = Math.max(size - 10, 1)

  return (
    <span
      ref={ref}
      className={`${styles.root}${loaded ? ` ${styles.loaded}` : ''}`}
      data-loaded={loaded ? 'true' : 'false'}
      data-testid="deferred-char-image"
      style={{
        width: size,
        height: size,
        ['--deferred-char-fallback-size' as string]: `${fallbackSize}px`,
      }}
    >
      <span
        className={`${styles.fallback}${
          source === 'ipamjm' ? ` ${styles.ipamjmFallback}` : ''
        }`}
        aria-hidden={loaded}
        data-testid="deferred-char-fallback"
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
          className={styles.img}
          data-testid="deferred-char-image-img"
          onLoad={onImageLoad}
        />
      ) : null}
    </span>
  )
})

export default DeferredCharSvgImageView
