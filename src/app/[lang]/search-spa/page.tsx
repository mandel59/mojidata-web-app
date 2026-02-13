import { getLanguage, getText } from '@/getText'
import { Metadata } from 'next'
import { Suspense } from 'react'
import SearchSpaClient from './searchSpaClient'
import MojidataSearchForm from '@/components/MojidataSearchForm'
import SpaAssetsPrefetcher from '@/spa/SpaAssetsPrefetcher'
import MobileFormDrawer from '@/components/MobileFormDrawer'
import LoadingArticle from '@/components/LoadingArticle'
import { castToString } from '../searchParams'

type Props = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const { page } = resolvedSearchParams
  const query = castToString(resolvedSearchParams.query)
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
  }
}

export default async function SearchSpa({ params, searchParams }: Props) {
  const { lang } = await params
  const language = getLanguage(lang)
  const resolvedSearchParams = await searchParams
  const query = castToString(resolvedSearchParams.query).trim()

  if (!query) {
    return (
      <section>
        <SpaAssetsPrefetcher kind="idsfind" />
        <MojidataSearchForm lang={language} action="/search-spa" />
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <SpaAssetsPrefetcher kind="idsfind" />
      <section className="md:hidden">
        <MobileFormDrawer
          buttonLabel={getText('mojidata-search.nav', language)}
          title={getText('mojidata-search.nav', language)}
        >
          <MojidataSearchForm lang={language} action="/search-spa" />
        </MobileFormDrawer>
      </section>
      <section className="hidden md:block">
        <MojidataSearchForm lang={language} action="/search-spa" />
      </section>
      <section>
        <div data-spa="search">
          <noscript>
            <p>This page requires JavaScript.</p>
          </noscript>
          <Suspense fallback={<LoadingArticle />}>
            <SearchSpaClient lang={language} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}
