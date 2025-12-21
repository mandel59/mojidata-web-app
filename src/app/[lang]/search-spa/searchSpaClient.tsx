'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { parseQuery } from '../search/search'
import { idsfindBrowserAllResults } from '@/spa/mojidataApiBrowser'

import { Language } from '@/getText'

function normalize(s: string) {
  const vsPattern = /[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/gu
  return s.normalize('NFC').replace(vsPattern, '')
}

export default function SearchSpaClient(props: { lang: Language }) {
  const langPrefix = `/${props.lang}`
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentQuery = (searchParams.get('query') ?? '').trim()
  const currentPage = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)
  const pageSize = 50

  const [draftQuery, setDraftQuery] = useState(currentQuery)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<string[]>([])
  const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    setDraftQuery(currentQuery)
  }, [currentQuery])

  const offset = (currentPage - 1) * pageSize
  const pageResults = useMemo(
    () => results.slice(offset, offset + pageSize),
    [results, offset],
  )
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  useEffect(() => {
    let cancelled = false
    if (!currentQuery) {
      setResults([])
      setTotal(0)
      setError(null)
      setLoading(false)
      return
    }
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const parsed = parseQuery(currentQuery)
        const { results, total } = await idsfindBrowserAllResults({
          ids: parsed.ids.map(normalize),
          whole: parsed.whole.map(normalize),
          ps: parsed.ps,
          qs: parsed.qs,
        })
        if (cancelled) return
        setResults(results)
        setTotal(total)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [currentQuery])

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    const q = draftQuery.trim()
    const url = new URL(pathname, 'http://local/')
    if (q) url.searchParams.set('query', q)
    router.push(url.pathname + url.search)
  }

  const gotoPage = (page: number) => {
    const url = new URL(pathname, 'http://local/')
    if (currentQuery) url.searchParams.set('query', currentQuery)
    if (page > 1) url.searchParams.set('page', String(page))
    router.push(url.pathname + url.search)
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          name="query"
          value={draftQuery}
          onChange={(e) => setDraftQuery(e.target.value)}
          placeholder="Enter search queries..."
        />
        <button type="submit">Search</button>
      </form>

      {!currentQuery && <p>Enter a query to search.</p>}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {currentQuery && !loading && !error && (
        <div>
          <p>
            {total.toLocaleString()} results. Page {currentPage} of {totalPages}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {pageResults.map((char) => (
              <a
                key={char}
                href={`${langPrefix}/mojidata/${encodeURIComponent(char)}`}
              >
                {char}
              </a>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => gotoPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => gotoPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
