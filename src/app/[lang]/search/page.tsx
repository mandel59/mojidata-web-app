import { Metadata, ResolvingMetadata } from 'next'
import { Suspense } from 'react'
import LoadingArticle from '@/components/LoadingArticle'
import MojidataSearchForm from '@/components/MojidataSearchForm'
import IdsFindResponse from '../idsfind/IdsFindResponse'
import { getLanguage } from '@/getText'

export default async function Search({
  params,
  searchParams,
}: PageProps<'/[lang]/search'>) {
  const { lang } = await params
  const resolvedSearchParams = await searchParams
  const language = getLanguage(lang)
  let { query, page, bot, disableExternalLinks } = resolvedSearchParams
  if (Array.isArray(query)) {
    query = query.join(' ')
  }
  if (typeof query === 'string') {
    query = query.trim()
  }
  if (!query) {
    return (
      <div>
        <nav className="container">
          <MojidataSearchForm lang={language} action="/search" />
        </nav>
      </div>
    )
  }
  return (
    <div className="container">
      <div className="grid">
        <nav>
          <MojidataSearchForm lang={language} action="/search" />
        </nav>
        <main>
          <Suspense
            key={JSON.stringify({ query })}
            fallback={<LoadingArticle />}
          >
            <IdsFindResponse
              path="/search"
              ids={[]}
              whole={[]}
              query={query}
              page={page ? Number(page) : undefined}
              bot={!!bot}
              disableExternalLinks={!!disableExternalLinks}
            />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export async function generateMetadata(
  { searchParams }: PageProps<'/[lang]/search'>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
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
  }
}
