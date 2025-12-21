import { Metadata } from 'next'
import { Suspense } from 'react'
import { getLanguage } from '@/getText'
import IdsFinder from '@/components/IdsFinder'
import LoadingArticle from '@/components/LoadingArticle'
import IdsFindSpaClient from './idsfindSpaClient'

type Props = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function castToArray<T>(x: undefined | T | T[]): T[] {
  return Array.isArray(x) ? x : x != null ? [x] : []
}

function castToString<T>(x: undefined | T | T[], joiner: string = ' '): string {
  return Array.isArray(x) ? x.join(joiner) : x != null ? String(x) : ''
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const { ids, whole, query, page } = resolvedSearchParams
  function buildLocalePath(locale: string) {
    const url = new URL(`https://mojidata.ryusei.dev/${locale}/idsfind`)
    castToArray(ids).forEach((v) => url.searchParams.append('ids', v))
    castToArray(whole).forEach((v) => url.searchParams.append('whole', v))
    const queryString = castToString(query)
    if (queryString) url.searchParams.append('query', queryString)
    if (page != null) url.searchParams.append('page', String(page))
    return url.pathname + url.search
  }
  function buildCanonicalPath() {
    const url = new URL(`https://mojidata.ryusei.dev/idsfind`)
    castToArray(ids).forEach((v) => url.searchParams.append('ids', v))
    castToArray(whole).forEach((v) => url.searchParams.append('whole', v))
    const queryString = castToString(query)
    if (queryString) url.searchParams.append('query', queryString)
    if (page != null) url.searchParams.append('page', String(page))
    return url.pathname + url.search
  }
  return {
    alternates: {
      canonical: buildCanonicalPath(),
      languages: {
        'en-US': buildLocalePath('en-US'),
        'ja-JP': buildLocalePath('ja-JP'),
      },
    },
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default async function IdsFindSpa({ params, searchParams }: Props) {
  const { lang } = await params
  const resolvedSearchParams = await searchParams
  const language = getLanguage(lang)
  const { ids, whole, query } = resolvedSearchParams
  const idsArray = castToArray(ids)
  const wholeArray = castToArray(whole)
  const queryString = castToString(query)

  if (idsArray.length === 0 && wholeArray.length === 0 && !queryString) {
    return (
      <div>
        <nav className="container">
          <IdsFinder lang={language} action="/idsfind-spa" />
        </nav>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="grid">
        <nav>
          <IdsFinder lang={language} action="/idsfind-spa" />
        </nav>
        <main>
          <div data-spa="idsfind">
            <noscript>
              <p>This page requires JavaScript.</p>
            </noscript>
            <Suspense fallback={<LoadingArticle />}>
              <IdsFindSpaClient lang={language} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
