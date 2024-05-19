'use client'

import GetForm from './GetForm'
import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import './MojidataSearchForm.css'

export default function MojidataSearchForm() {
  const pathname = usePathname()
  const pathIsIdsfind = pathname === '/search'
  const searchParams = useSearchParams()
  const initialQuery = pathIsIdsfind ? searchParams.get('query') ?? '' : ''
  const [query, setQuery] = useState<string>(initialQuery)
  return (
    <div className="mojidata-search">
      <GetForm action="/search">
        <article>
          <h2>Mojidata Search</h2>
          <div key="query">
            <input
              name="query"
              value={query}
              placeholder="Search by reading, total strokes, code point or a character."
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <footer>
            <button>Search</button>
          </footer>
        </article>
      </GetForm>
    </div>
  )
}
