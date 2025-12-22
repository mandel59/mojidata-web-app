import MojidataSpaClient from './mojidataSpaClient'
import { getLanguage } from '@/getText'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ char: string; lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { char, lang } = await params
  const resolvedSearchParams = await searchParams
  const disableExternalLinks =
    resolvedSearchParams.disableExternalLinks === '1' ||
    (Array.isArray(resolvedSearchParams.disableExternalLinks) &&
      resolvedSearchParams.disableExternalLinks.includes('1'))
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
      canonical: `/mojidata/${char}`,
      languages: {
        'en-US': `/en-US/mojidata/${char}`,
        'ja-JP': `/ja-JP/mojidata/${char}`,
      },
    },
    robots: {
      index: false,
      follow: true,
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

export default async function MojidataSpa({ params }: Props) {
  const { char, lang } = await params
  const ucs = decodeURIComponent(char)
  const language = getLanguage(lang)

  return (
    <div>
      <main className="container">
        <div data-spa="mojidata">
          <noscript>
            <p>This page requires JavaScript.</p>
          </noscript>
          <MojidataSpaClient char={ucs} lang={language} />
        </div>
      </main>
    </div>
  )
}
