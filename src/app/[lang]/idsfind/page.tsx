import { Metadata, ResolvingMetadata } from 'next'
import { Suspense } from 'react'
import IdsFindResponse from './IdsFindResponse'
import LoadingArticle from '@/components/LoadingArticle'
import IdsFinder from '@/components/IdsFinder'
import { getLanguage } from '@/getText'

function castToArray<T>(x: undefined | T | T[]): T[] {
  return Array.isArray(x) ? x : x != null ? [x] : []
}

function castToString<T>(x: undefined | T | T[], joiner: string = ' '): string {
  return Array.isArray(x) ? x.join(joiner) : x != null ? String(x) : ''
}

export default async function IdsFind({
  params,
  searchParams,
}: PageProps<'/[lang]/idsfind'>) {
  const { lang } = await params
  const resolvedSearchParams = await searchParams
  const language = getLanguage(lang)
  const langPrefix = `/${lang}`
  const { ids, whole, query, page, bot, disableExternalLinks } =
    resolvedSearchParams
  const idsArray = castToArray(ids)
  const wholeArray = castToArray(whole)
  const queryString = castToString(query)
  if (idsArray.length === 0 && wholeArray.length === 0 && !queryString) {
    return (
      <div>
        <nav className="container">
          <IdsFinder lang={language} action={`${langPrefix}/idsfind`} />
        </nav>
      </div>
    )
  }
  return (
    <div className="container">
      <div className="grid">
        <nav>
          <IdsFinder lang={language} action={`${langPrefix}/idsfind`} />
        </nav>
        <main>
          <Suspense
            key={JSON.stringify({ ids, whole, query })}
            fallback={<LoadingArticle />}
          >
            <IdsFindResponse
              langPrefix={langPrefix}
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
  { params, searchParams }: PageProps<'/[lang]/idsfind'>,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { lang } = await params
  const resolvedSearchParams = await searchParams
  const { ids, whole, query, page } = resolvedSearchParams
  function buildPath(locale: string) {
    const url = new URL(`https://mojidata.ryusei.dev/${locale}/idsfind`)
    castToArray(ids).forEach((v) => url.searchParams.append('ids', v))
    castToArray(whole).forEach((v) => url.searchParams.append('whole', v))
    const queryString = castToString(query)
    if (queryString) url.searchParams.append('query', queryString)
    if (page != null) url.searchParams.append('page', String(page))
    return url.pathname + url.search
  }
  return {
    alternates: {
      canonical: buildPath(lang),
      languages: {
        'en-US': buildPath('en-US'),
        'ja-JP': buildPath('ja-JP'),
      },
    },
  }
}
