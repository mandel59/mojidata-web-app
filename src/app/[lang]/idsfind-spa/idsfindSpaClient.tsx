'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import LoadingArticle from '@/components/LoadingArticle'
import IdsFindResponseView from '@/components/IdsFindResponseView'
import { idsfindBrowserAllResults } from '@/spa/mojidataApiBrowser'
import { parseQuery } from '../search/search'

function normalize(s: string) {
  const vsPattern = /[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/gu
  return s.normalize('NFC').replace(vsPattern, '')
}

function stripLocalePrefix(pathname: string) {
  return pathname.replace(/^\/[a-z]{2}-[A-Z]{2}(?=\/)/, '')
}

const idsfindResultCache = new Map<string, { results: string[]; total: number }>()

export default function IdsFindSpaClient() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const canonicalPathname = useMemo(() => stripLocalePrefix(pathname), [pathname])

  const bot = searchParams.get('bot') != null
  const disableExternalLinks = searchParams.get('disableExternalLinks') === '1'

  const ids = useMemo(() => searchParams.getAll('ids').map(normalize), [searchParams])
  const whole = useMemo(
    () => searchParams.getAll('whole').map(normalize),
    [searchParams],
  )
  const query = useMemo(() => (searchParams.get('query') ?? '').trim(), [searchParams])
  const currentPage = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)
  const pageSize = 50

  const cacheKey = useMemo(
    () => JSON.stringify({ ids, whole, query, bot, disableExternalLinks }),
    [ids, whole, query, bot, disableExternalLinks],
  )
  const cached = idsfindResultCache.get(cacheKey)

  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<string[]>(cached?.results ?? [])
  const [total, setTotal] = useState<number>(cached?.total ?? 0)

  const offset = (currentPage - 1) * pageSize
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const baseUrl = useMemo(() => {
    const url = new URL(canonicalPathname, 'http://local/')
    ids.forEach((v) => url.searchParams.append('ids', v))
    whole.forEach((v) => url.searchParams.append('whole', v))
    if (query) url.searchParams.set('query', query)
    if (bot) url.searchParams.set('bot', '1')
    if (disableExternalLinks) url.searchParams.set('disableExternalLinks', '1')
    return url
  }, [canonicalPathname, ids, whole, query, bot, disableExternalLinks])

  useEffect(() => {
    let cancelled = false
    if (ids.length === 0 && whole.length === 0 && !query) {
      setResults([])
      setTotal(0)
      setError(null)
      setLoading(false)
      return
    }

    const cached = idsfindResultCache.get(cacheKey)
    if (cached) {
      setResults(cached.results)
      setTotal(cached.total)
      setLoading(false)
      setError(null)
      return
    }

    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const parsed = parseQuery(query)
        const { results, total } = await idsfindBrowserAllResults({
          ids: [...ids, ...parsed.ids.map(normalize)],
          whole: [...whole, ...parsed.whole.map(normalize)],
          ps: parsed.ps,
          qs: parsed.qs,
        })
        if (cancelled) return
        idsfindResultCache.set(cacheKey, { results, total })
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
  }, [cacheKey, ids, whole, query])

  if (ids.length === 0 && whole.length === 0 && !query) return null
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  const prev =
    currentPage > 1
      ? (() => {
          const url = new URL(baseUrl)
          if (currentPage - 1 > 1)
            url.searchParams.set('page', String(currentPage - 1))
          else url.searchParams.delete('page')
          return url.pathname + url.search
        })()
      : null

  const next =
    currentPage < totalPages
      ? (() => {
          const url = new URL(baseUrl)
          url.searchParams.set('page', String(currentPage + 1))
          return url.pathname + url.search
        })()
      : null

  const wholeSearch =
    ids.length === 0 && whole.length === 1 && !/[a-z？]/.test(whole[0] ?? '')

  const hasAnyResult = results.length > 0 || total > 0
  if (loading && !hasAnyResult) return <LoadingArticle />

  return (
    <div className="relative" aria-busy={loading}>
      {loading && hasAnyResult && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-end p-2">
          <span className="rounded bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow">
            Updating…
          </span>
        </div>
      )}
      <IdsFindResponseView
        linkMode="server"
        results={results}
        total={total}
        offset={offset}
        size={pageSize}
        pageNum={currentPage}
        totalPages={totalPages}
        prev={prev}
        next={next}
        wholeSearch={wholeSearch}
        whole={whole[0]}
        bot={bot}
        disableExternalLinks={disableExternalLinks}
      />
    </div>
  )
}
