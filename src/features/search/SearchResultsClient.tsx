'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import LoadingArticle from '@/components/LoadingArticle'
import IdsFindResponseView from '@/components/IdsFindResponseView'
import { idsfindBrowserAllResults } from '@/spa/mojidataApiBrowser'
import { buildIdsfindAllResultsRequest } from '@/search/idsfindRequest'
import { buildPageHref, stripLocalePrefix } from '@/search/shared'

interface SearchCachedResult {
  results: string[]
  total: number
}

const searchResultCache = new Map<string, SearchCachedResult>()

export default function SearchResultsClient() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const canonicalPathname = stripLocalePrefix(pathname)

  const currentQuery = (searchParams.get('query') ?? '').trim()
  const currentPage = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)
  const pageSize = 50
  const bot = searchParams.get('bot') != null
  const disableExternalLinks = searchParams.get('disableExternalLinks') === '1'
  const cacheKey = JSON.stringify({ query: currentQuery, bot, disableExternalLinks })
  const cached = searchResultCache.get(cacheKey)

  const [loading, setLoading] = useState(!!currentQuery && !cached)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<string[]>(cached?.results ?? [])
  const [total, setTotal] = useState<number>(cached?.total ?? 0)

  const offset = (currentPage - 1) * pageSize
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

    const cached = searchResultCache.get(cacheKey)
    if (cached) {
      setResults(cached.results)
      setTotal(cached.total)
      setError(null)
      setLoading(false)
      return
    }

    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const { results, total } = await idsfindBrowserAllResults(
          buildIdsfindAllResultsRequest({
            ids: [],
            whole: [],
            query: currentQuery,
          }),
        )
        if (cancelled) return
        searchResultCache.set(cacheKey, { results, total })
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
  }, [cacheKey, currentQuery])

  if (!currentQuery) return null
  if (loading && total === 0) return <LoadingArticle />
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  const prev =
    currentPage > 1
      ? (() => {
          const url = new URL(canonicalPathname, 'http://local/')
          url.searchParams.set('query', currentQuery)
          return buildPageHref(url, currentPage - 1)
        })()
      : null
  const next =
    currentPage < totalPages
      ? (() => {
          const url = new URL(canonicalPathname, 'http://local/')
          url.searchParams.set('query', currentQuery)
          return buildPageHref(url, currentPage + 1)
        })()
      : null
  const pageResults = results.slice(offset, offset + pageSize)

  return (
    <div aria-busy={loading}>
      <IdsFindResponseView
        results={pageResults}
        total={total}
        offset={offset}
        size={pageSize}
        pageNum={currentPage}
        totalPages={totalPages}
        prev={prev}
        next={next}
        wholeSearch={false}
        bot={bot}
        disableExternalLinks={disableExternalLinks}
      />
    </div>
  )
}
