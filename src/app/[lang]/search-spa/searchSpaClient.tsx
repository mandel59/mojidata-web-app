'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { parseQuery } from '../search/search'
import { idsfindBrowserAllResults } from '@/spa/mojidataApiBrowser'

import { Language } from '@/getText'
import LoadingArticle from '@/components/LoadingArticle'
import IdsFindResponseView from '@/components/IdsFindResponseView'

function normalize(s: string) {
  const vsPattern = /[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/gu
  return s.normalize('NFC').replace(vsPattern, '')
}

function stripLocalePrefix(pathname: string) {
  return pathname.replace(/^\/[a-z]{2}-[A-Z]{2}(?=\/)/, '')
}

export default function SearchSpaClient(props: { lang: Language }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const canonicalPathname = stripLocalePrefix(pathname)

  const currentQuery = (searchParams.get('query') ?? '').trim()
  const currentPage = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)
  const pageSize = 50
  const bot = searchParams.get('bot') != null
  const disableExternalLinks = searchParams.get('disableExternalLinks') === '1'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<string[]>([])
  const [total, setTotal] = useState<number>(0)

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

  if (!currentQuery) return null
  if (loading) return <LoadingArticle />
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  const prev =
    currentPage > 1
      ? (() => {
          const url = new URL(canonicalPathname, 'http://local/')
          url.searchParams.set('query', currentQuery)
          if (currentPage - 1 > 1)
            url.searchParams.set('page', String(currentPage - 1))
          return url.pathname + url.search
        })()
      : null
  const next =
    currentPage < totalPages
      ? (() => {
          const url = new URL(canonicalPathname, 'http://local/')
          url.searchParams.set('query', currentQuery)
          url.searchParams.set('page', String(currentPage + 1))
          return url.pathname + url.search
        })()
      : null

  return (
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
      wholeSearch={false}
      bot={bot}
      disableExternalLinks={disableExternalLinks}
    />
  )
}
