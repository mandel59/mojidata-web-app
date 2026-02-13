import { Metadata } from 'next'
import { Suspense } from 'react'
import { getLanguage, getText } from '@/getText'
import IdsFinder from '@/components/IdsFinder'
import LoadingArticle from '@/components/LoadingArticle'
import IdsFindSpaClient from './idsfindSpaClient'
import SpaAssetsPrefetcher from '@/spa/SpaAssetsPrefetcher'
import MobileFormDrawer from '@/components/MobileFormDrawer'
import {
  appendArraySearchParams,
  castToArray,
  castToString,
} from '../searchParams'

type Props = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const { ids, whole, query, page } = resolvedSearchParams
  function buildLocalePath(locale: string) {
    const url = new URL(`https://mojidata.ryusei.dev/${locale}/idsfind`)
    appendArraySearchParams(url, 'ids', castToArray(ids))
    appendArraySearchParams(url, 'whole', castToArray(whole))
    const queryString = castToString(query)
    if (queryString) url.searchParams.append('query', queryString)
    if (page != null) url.searchParams.append('page', String(page))
    return url.pathname + url.search
  }
  function buildCanonicalPath() {
    const url = new URL(`https://mojidata.ryusei.dev/idsfind`)
    appendArraySearchParams(url, 'ids', castToArray(ids))
    appendArraySearchParams(url, 'whole', castToArray(whole))
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
      <section>
        <SpaAssetsPrefetcher kind="idsfind" />
        <IdsFinder lang={language} action="/idsfind-spa" />
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <SpaAssetsPrefetcher kind="idsfind" />
      <section className="md:hidden">
        <MobileFormDrawer
          buttonLabel={getText('ids-finder.nav', language)}
          title={getText('ids-finder.nav', language)}
        >
          <IdsFinder lang={language} action="/idsfind-spa" />
        </MobileFormDrawer>
      </section>
      <section className="hidden md:block">
        <IdsFinder lang={language} action="/idsfind-spa" />
      </section>
      <section>
        <div data-spa="idsfind">
          <noscript>
            <p>This page requires JavaScript.</p>
          </noscript>
          <Suspense fallback={<LoadingArticle />}>
            <IdsFindSpaClient />
          </Suspense>
        </div>
      </section>
    </div>
  )
}
