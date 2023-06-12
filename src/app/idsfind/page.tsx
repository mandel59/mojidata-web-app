import { Metadata, ResolvingMetadata } from 'next'
import { Suspense } from 'react'
import IdsFindResponse from './IdsFindResponse'
import Loading from '@/components/Loading'
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
  const { ids, whole, page } = searchParams
  return (
    <div>
      <main className="container">
        <Suspense fallback={<Loading />}>
          <IdsFindResponse
            ids={castToArray(ids)}
            whole={castToArray(whole)}
            page={page ? Number(page) : undefined}
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
