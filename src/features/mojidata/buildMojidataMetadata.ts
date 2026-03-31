import type { Metadata } from 'next'
import {
  getCanonicalRoutePath,
  getLocalizedCanonicalRoutePath,
} from '@/deliveryPolicy'

export function buildMojidataMetadata(params: {
  char: string
  disableExternalLinks: boolean
}): Metadata {
  const { char, disableExternalLinks } = params
  const ucs = String.fromCodePoint(
    decodeURIComponent(char).codePointAt(0) ?? 0x20,
  )
  const codePoint =
    ucs.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0') ?? 0x20
  const siteName = 'Mojidata Web App'
  const title = `U+${codePoint} ${ucs}`
  const description = `Character data for U+${codePoint} ${ucs}`

  return {
    title,
    alternates: {
      canonical: getCanonicalRoutePath('mojidata', char),
      languages: {
        'en-US': getLocalizedCanonicalRoutePath('mojidata', 'en-US', char),
        'ja-JP': getLocalizedCanonicalRoutePath('mojidata', 'ja-JP', char),
      },
    },
    openGraph: {
      title,
      description,
      siteName,
      ...(disableExternalLinks
        ? {}
        : { images: [`/api/mojidata/${char}/opengraph-image`] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `U+${codePoint} ${ucs} - ${siteName}`,
      description,
      creator: '@mandel59',
      ...(disableExternalLinks
        ? {}
        : { images: [`/api/mojidata/${char}/opengraph-image`] }),
    },
  }
}
