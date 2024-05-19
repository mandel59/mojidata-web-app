import { Metadata, ResolvingMetadata } from 'next'
import { Suspense } from 'react'
import SearchResponse from './SearchResponse'
import LoadingArticle from '@/components/LoadingArticle'
import MojidataSearchForm from '@/components/MojidataSearchForm'

export const runtime = 'experimental-edge'

type Props = {
  params: {}
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function Search({ searchParams }: Props) {
  let { query, page } = searchParams
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
          <MojidataSearchForm />
        </nav>
      </div>
    )
  }
  return (
    <div>
      <main className="container">
        <Suspense fallback={<LoadingArticle />}>
          <SearchResponse
            query={query}
            page={page ? Number(page) : undefined}
          />
        </Suspense>
      </main>
      <nav className="container">
        <MojidataSearchForm />
      </nav>
    </div>
  )
}

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  let { query, page } = searchParams
  const url = new URL('https://mojidata.ryusei.dev/search')
  if (Array.isArray(query)) {
    query = query.join(' ')
  }
  if (query != null) url.searchParams.append('query', String(page))
  if (page != null) url.searchParams.append('page', String(page))
  return {
    alternates: {
      canonical: url.pathname + url.search,
    },
  }
}
