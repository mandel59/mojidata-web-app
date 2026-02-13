import { Metadata, ResolvingMetadata } from 'next'
import IdsFinder from '@/components/IdsFinder'
import { getLanguage, getText } from '@/getText'
import IdsFindSpaClient from '../idsfind-spa/idsfindSpaClient'
import { appendArraySearchParams, castToArray, castToString } from '../searchParams'

export default async function IdsFind({
  params,
  searchParams,
}: PageProps<'/[lang]/idsfind'>) {
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
        <IdsFinder lang={language} action="/idsfind" />
      </section>
    )
  }
  return (
    <div className="space-y-4">
      <section className="md:hidden">
        <details className="rounded-md border border-border bg-card px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">
            {getText('ids-finder.nav', language)}
          </summary>
          <div className="pt-2">
            <IdsFinder lang={language} action="/idsfind" />
          </div>
        </details>
      </section>
      <section className="hidden md:block">
        <IdsFinder lang={language} action="/idsfind" />
      </section>
      <section>
        <IdsFindSpaClient />
      </section>
    </div>
  )
}

export async function generateMetadata(
  { searchParams }: PageProps<'/[lang]/idsfind'>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
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
