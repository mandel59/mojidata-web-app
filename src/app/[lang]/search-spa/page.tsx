import { getLanguage } from '@/getText'
import { Suspense } from 'react'
import SearchSpaClient from './searchSpaClient'
import MojidataSearchForm from '@/components/MojidataSearchForm'

type Props = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SearchSpa({ params, searchParams }: Props) {
  const { lang } = await params
  const language = getLanguage(lang)
  const resolvedSearchParams = await searchParams
  let { query } = resolvedSearchParams
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
          <MojidataSearchForm lang={language} action="/search-spa" />
        </nav>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="grid">
        <nav>
          <MojidataSearchForm lang={language} action="/search-spa" />
        </nav>
        <main>
          <div data-spa="search">
            <noscript>
              <p>This page requires JavaScript.</p>
            </noscript>
            <Suspense fallback={<p>Loading...</p>}>
              <SearchSpaClient lang={language} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
