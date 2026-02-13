import { Metadata, ResolvingMetadata } from 'next'
import MojidataSearchForm from '@/components/MojidataSearchForm'
import { getLanguage, getText } from '@/getText'
import { castToString } from '../searchParams'
import MobileFormDrawer from '@/components/MobileFormDrawer'
import SearchSpaClient from '../search-spa/searchSpaClient'

export default async function Search({
  params,
  searchParams,
}: PageProps<'/[lang]/search'>) {
  const { lang } = await params
  const resolvedSearchParams = await searchParams
  const language = getLanguage(lang)
  const query = castToString(resolvedSearchParams.query).trim()
  if (!query) {
    return (
      <section>
        <MojidataSearchForm lang={language} action="/search" />
      </section>
    )
  }
  return (
    <div className="space-y-4">
      <section className="md:hidden">
        <MobileFormDrawer
          buttonLabel={getText('mojidata-search.nav', language)}
          title={getText('mojidata-search.nav', language)}
        >
          <MojidataSearchForm lang={language} action="/search" />
        </MobileFormDrawer>
      </section>
      <section className="hidden md:block">
        <MojidataSearchForm lang={language} action="/search" />
      </section>
      <section>
        <SearchSpaClient lang={language} />
      </section>
    </div>
  )
}

export async function generateMetadata(
  { searchParams }: PageProps<'/[lang]/search'>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
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
