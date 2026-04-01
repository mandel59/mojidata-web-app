'use client'

import { useEffect, useRef, useState } from 'react'
import { toGlyphWikiName } from '@/glyphwiki/toGlyphWikiName'

export interface DeferredCharSvgImageProps {
  char: string
  size: number
  alt?: string
  source: 'glyphwiki' | 'ipamjm'
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
  const { char, size, alt, source } = props
  const [shouldLoadImage, setShouldLoadImage] = useState(false)
  const [loadedImageKey, setLoadedImageKey] = useState<string | null>(null)
  const rootRef = useRef<HTMLSpanElement | null>(null)
  const imageKey = `${source}:${char}`
  const loaded = loadedImageKey === imageKey

  useEffect(() => {
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
  }, [char, source])

  return (
    <span
      ref={rootRef}
      className="mojidata-deferred-char-image"
      style={{ width: size, height: size }}
    >
      <span
        className="mojidata-deferred-char-image__fallback mojidata-raw-char"
        aria-hidden={loaded}
      >
        {char}
      </span>
      {shouldLoadImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={buildSrc(source, char)}
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
