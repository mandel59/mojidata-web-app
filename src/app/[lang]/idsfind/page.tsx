import { Metadata, ResolvingMetadata } from 'next'
import { Suspense } from 'react'
import IdsFindResponse from './IdsFindResponse'
import LoadingArticle from '@/components/LoadingArticle'
import IdsFinder from '@/components/IdsFinder'
import { getLanguage } from '@/getText'

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

export default async function IdsFind({ params, searchParams }: Props) {
  const { lang } = await params
  const resolvedSearchParams = await searchParams
  const language = getLanguage(lang)
  const { ids, whole, query, page, bot, disableExternalLinks } =
    resolvedSearchParams
  const idsArray = castToArray(ids)
  const wholeArray = castToArray(whole)
  const queryString = castToString(query)
  if (idsArray.length === 0 && wholeArray.length === 0 && !queryString) {
    return (
      <div>
        <nav className="container">
          <IdsFinder lang={language} />
        </nav>
      </div>
    )
  }
  return (
    <div className="container">
      <div className="grid">
        <nav>
          <IdsFinder lang={language} />
        </nav>
        <main>
          <Suspense
            key={JSON.stringify({ ids, whole, query })}
            fallback={<LoadingArticle />}
          >
            <IdsFindResponse
              ids={idsArray}
              whole={wholeArray}
              query={queryString}
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
  { searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const { ids, whole, query, page } = resolvedSearchParams
  const url = new URL('https://mojidata.ryusei.dev/idsfind')
  castToArray(ids).forEach((ids) => url.searchParams.append('ids', ids))
  castToArray(whole).forEach((whole) => url.searchParams.append('whole', whole))
  const queryString = castToString(query)
  if (queryString) url.searchParams.append('query', queryString)
  if (page != null) url.searchParams.append('page', String(page))
  return {
    alternates: {
      canonical: url.pathname + url.search,
    },
  }
}
