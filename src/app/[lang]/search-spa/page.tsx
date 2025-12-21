import { getLanguage } from '@/getText'
import { Suspense } from 'react'
import SearchSpaClient from './searchSpaClient'

type Props = {
  params: Promise<{ lang: string }>
}

export default async function SearchSpa({ params }: Props) {
  const { lang } = await params
  const language = getLanguage(lang)

  return (
    <div className="container">
      <main>
        <article data-spa="search">
          <h1>Search (SPA)</h1>
          <noscript>
            <p>This page requires JavaScript.</p>
          </noscript>
          <Suspense fallback={<p>Loading...</p>}>
            <SearchSpaClient lang={language} />
          </Suspense>
        </article>
      </main>
    </div>
  )
}
