'use client'

import { useEffect, useRef, useState } from 'react'
import { toGlyphWikiName } from '@/glyphwiki/toGlyphWikiName'
import DeferredCharSvgImageView from './DeferredCharSvgImageView'

export interface DeferredCharSvgImageProps {
  char: string
  size: number
  alt?: string
  source: 'glyphwiki' | 'ipamjm'
  eager?: boolean
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
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
    eager = false,
    loading,
    fetchPriority,
    debugLoadState = 'auto',
    debugSrc,
  } = props
  const [shouldLoadImage, setShouldLoadImage] = useState(eager)
  const [loadedImageKey, setLoadedImageKey] = useState<string | null>(null)
  const rootRef = useRef<HTMLSpanElement | null>(null)
  const imageKey = `${source}:${char}`
  const forcedFallback = debugLoadState === 'fallback'
  const forcedLoaded = debugLoadState === 'loaded'
  const loaded = forcedLoaded || loadedImageKey === imageKey
  const imageSrc = debugSrc ?? buildSrc(source, char)

  useEffect(() => {
    if (debugLoadState !== 'auto') return
    if (eager) return
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
  }, [char, source, debugLoadState, eager])

  const renderImage = forcedLoaded || eager || shouldLoadImage

  return (
    <DeferredCharSvgImageView
      ref={rootRef}
      char={char}
      size={size}
      alt={alt}
      source={source}
      loaded={loaded}
      renderImage={renderImage && !forcedFallback}
      imageSrc={imageSrc}
      loading={loading ?? (eager ? 'eager' : 'lazy')}
      fetchPriority={fetchPriority}
      onImageLoad={() => setLoadedImageKey(imageKey)}
    />
  )
}
