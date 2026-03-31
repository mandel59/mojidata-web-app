'use client'

import { useEffect, useState } from 'react'
import type { Language } from '@/getText'
import type { MojidataResults } from '@/mojidata/mojidataShared'
import LoadingMojidataArticle from '@/components/LoadingMojidataArticle'
import { mojidataBrowser } from '@/spa/mojidataApiBrowser'
import MojidataResponseView from '@/app/[lang]/mojidata/[char]/MojidataResponseView'
import { loadMojidataResultData } from './loadMojidataResultData'

export interface MojidataResultsClientProps {
  char: string
  lang: Language
  bot: boolean
  disableExternalLinks: boolean
  forceMojiJohoImage: boolean
}

export default function MojidataResultsClient(props: MojidataResultsClientProps) {
  const { char, lang, bot, disableExternalLinks, forceMojiJohoImage } = props

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{
    results: MojidataResults
    canonicalCharacter: MojidataResults
    compatibilityCharacters?: MojidataResults[]
    isCompatibilityCharacter: boolean
  } | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const nextData = await loadMojidataResultData(mojidataBrowser, char)
        if (cancelled) return
        setData(nextData)
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
  }, [char])

  if (loading) return <LoadingMojidataArticle />
  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (!data) return <p>No results.</p>

  return (
    <MojidataResponseView
      ucs={char}
      results={data.results}
      canonicalCharacter={data.canonicalCharacter}
      compatibilityCharacters={data.compatibilityCharacters}
      isCompatibilityCharacter={data.isCompatibilityCharacter}
      bot={bot}
      disableExternalLinks={disableExternalLinks}
      forceMojiJohoImage={forceMojiJohoImage}
      lang={lang}
    />
  )
}
