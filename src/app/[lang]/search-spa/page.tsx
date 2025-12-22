import { getLanguage } from '@/getText'
import { Metadata } from 'next'
import { Suspense } from 'react'
import SearchSpaClient from './searchSpaClient'
import MojidataSearchForm from '@/components/MojidataSearchForm'
import SpaAssetsPrefetcher from '@/spa/SpaAssetsPrefetcher'

type Props = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  let { query, page } = resolvedSearchParams
  if (Array.isArray(query)) {
    query = query.join(' ')
  }
  function buildLocalePath(locale: string) {
    const url = new URL(`https://mojidata.ryusei.dev/${locale}/search`)
    if (query != null) url.searchParams.append('query', String(query))
    if (page != null) url.searchParams.append('page', String(page))
    return url.pathname + url.search
  }
  function buildCanonicalPath() {
    const url = new URL(`https://mojidata.ryusei.dev/search`)
    if (query != null) url.searchParams.append('query', String(query))
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

export default async function SearchSpa({ params, searchParams }: Props) {
  const { lang } = await params
  const language = getLanguage(lang)
  const resolvedSearchParams = await searchParams
  let { query } = resolvedSearchParams
  if (Array.isArray(query)) {
    query = query.join(' ')
  }
  if (typeof query === 'string') {
    query = query.trim()
  }

  if (!query) {
    return (
      <div>
        <SpaAssetsPrefetcher kind="idsfind" />
        <nav className="container">
          <MojidataSearchForm lang={language} action="/search-spa" />
        </nav>
      </div>
    )
  }

  return (
    <div className="container">
      <SpaAssetsPrefetcher kind="idsfind" />
      <div className="grid">
        <nav>
          <MojidataSearchForm lang={language} action="/search-spa" />
        </nav>
        <main>
          <div data-spa="search">
            <noscript>
              <p>This page requires JavaScript.</p>
            </noscript>
            <Suspense fallback={<p>Loading...</p>}>
              <SearchSpaClient lang={language} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
