import { Metadata, ResolvingMetadata } from 'next'
import { Suspense } from 'react'
import MojidataResponse from './MojidataResponse'
import LoadingArticle from '@/components/LoadingArticle'
import { notFound, redirect } from 'next/navigation'
import { getLanguage } from '@/getText'

type Props = {
  params: Promise<{ char: string; lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Mojidata({ params, searchParams }: Props) {
  const { char, lang } = await params
  const resolvedSearchParams = await searchParams
  const language = getLanguage(lang)
  const { bot, disableExternalLinks } = resolvedSearchParams
  const ucs = decodeURIComponent(char)
  if ((ucs.codePointAt(0) ?? 0) <= 0x7f) {
    notFound()
  }
  const ucsList = [...ucs]
  if (ucsList.length !== 1) {
    if (ucsList.length === 2) {
      if (
        /^\p{sc=Han}$/u.test(ucsList[0]) &&
        /^[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]$/u.test(ucsList[1])
      ) {
        // character with variation selector
        // redirect to the base character
        redirect(`/mojidata/${encodeURIComponent(ucsList[0])}`)
      } else {
        notFound()
      }
    }
  }

  return (
    <div>
      <main className="container">
        <Suspense fallback={<LoadingArticle />}>
          <MojidataResponse
            ucs={ucs}
            bot={!!bot}
            disableExternalLinks={!!disableExternalLinks}
            lang={language}
          />
        </Suspense>
      </main>
    </div>
  )
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { char } = await params
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
    },
    openGraph: {
      title,
      description,
      siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: `U+${codePoint} ${ucs} - ${siteName}`,
      description,
      creator: '@mandel59',
    },
  }
}
