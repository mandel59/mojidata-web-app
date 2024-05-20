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

export default function IdsFind({ searchParams }: Props) {
  const { ids, whole, page, bot } = searchParams
  const idsArray = castToArray(ids)
  const wholeArray = castToArray(whole)
  if (idsArray.length === 0 && wholeArray.length === 0) {
    return (
      <div>
        <nav className="container">
          <IdsFinder />
        </nav>
      </div>
    )
  }
  return (
    <div>
      <main className="container">
        <Suspense fallback={<LoadingArticle />}>
          <IdsFindResponse
            ids={idsArray}
            whole={wholeArray}
            page={page ? Number(page) : undefined}
            bot={!!bot}
          />
        </Suspense>
      </main>
      <nav className="container">
        <IdsFinder />
      </nav>
    </div>
  )
}

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { ids, whole, page } = searchParams
  const url = new URL('https://mojidata.ryusei.dev/idsfind')
  castToArray(ids).forEach((ids) => url.searchParams.append('ids', ids))
  castToArray(whole).forEach((whole) => url.searchParams.append('whole', whole))
  if (page != null) url.searchParams.append('page', String(page))
  return {
    alternates: {
      canonical: url.pathname + url.search,
    },
  }
}
