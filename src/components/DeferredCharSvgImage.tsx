'use client'

import { useEffect, useRef, useState } from 'react'
import { toGlyphWikiName } from '@/glyphwiki/toGlyphWikiName'

export interface DeferredCharSvgImageProps {
  char: string
  size: number
  alt?: string
  source: 'glyphwiki' | 'ipamjm'
  debugLoadState?: 'auto' | 'fallback' | 'loaded'
  debugSrc?: string
}

function buildSrc(source: DeferredCharSvgImageProps['source'], char: string) {
  const name = toGlyphWikiName(char)
  if (source === 'ipamjm') {
    return `/api/ipamjm/svg/${encodeURIComponent(name)}`
  }
  return `/api/glyphwiki/svg/${encodeURIComponent(name)}`
}

export default function DeferredCharSvgImage(
  props: DeferredCharSvgImageProps,
) {
  const {
    char,
    size,
    alt,
    source,
    debugLoadState = 'auto',
    debugSrc,
  } = props
  const [shouldLoadImage, setShouldLoadImage] = useState(false)
  const [loadedImageKey, setLoadedImageKey] = useState<string | null>(null)
  const rootRef = useRef<HTMLSpanElement | null>(null)
  const imageKey = `${source}:${char}`
  const forcedFallback = debugLoadState === 'fallback'
  const forcedLoaded = debugLoadState === 'loaded'
  const loaded = forcedLoaded || loadedImageKey === imageKey
  const imageSrc = debugSrc ?? buildSrc(source, char)

  useEffect(() => {
    if (debugLoadState !== 'auto') return
    const root = rootRef.current
    if (!root) return
    if (typeof IntersectionObserver === 'undefined') {
      const timer = window.setTimeout(() => {
        setShouldLoadImage(true)
      }, 0)
      return () => {
        window.clearTimeout(timer)
      }
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadImage(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '240px',
      },
    )
    observer.observe(root)
    return () => {
      observer.disconnect()
    }
  }, [char, source, debugLoadState])

  const renderImage = forcedLoaded || shouldLoadImage

  return (
    <span
      ref={rootRef}
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
      {renderImage && !forcedFallback ? (
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
          onLoad={() => setLoadedImageKey(imageKey)}
        />
      ) : null}
    </span>
  )
}
