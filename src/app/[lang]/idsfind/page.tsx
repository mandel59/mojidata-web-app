import { Metadata, ResolvingMetadata } from 'next'
import { Suspense } from 'react'
import IdsFindResponse from './IdsFindResponse'
import LoadingArticle from '@/components/LoadingArticle'
import IdsFinder from '@/components/IdsFinder'

export const runtime = 'experimental-edge'

type Props = {
  params: {}
  searchParams: { [key: string]: string | string[] | undefined }
}

function castToArray<T>(x: undefined | T | T[]): T[] {
  return Array.isArray(x) ? x : x != null ? [x] : []
}

function castToString<T>(x: undefined | T | T[], joiner: string = ' '): string {
  return Array.isArray(x) ? x.join(joiner) : x != null ? String(x) : ''
}

export default function IdsFind({ searchParams }: Props) {
  const { ids, whole, query, page, bot, disableExternalLinks } = searchParams
  const idsArray = castToArray(ids)
  const wholeArray = castToArray(whole)
  const queryString = castToString(query)
  if (idsArray.length === 0 && wholeArray.length === 0 && !queryString) {
    return (
      <div>
        <nav className="container">
          <IdsFinder />
        </nav>
      </div>
    )
  }
  return (
    <div className="container">
      <div className="grid">
        <nav>
          <IdsFinder />
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
  const { ids, whole, query, page } = searchParams
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
