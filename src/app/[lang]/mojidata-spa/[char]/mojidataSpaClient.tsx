'use client'

import { useEffect, useState } from 'react'
import { mojidataBrowser } from '@/spa/mojidataApiBrowser'
import type { Language } from '@/getText'
import MojidataResponseView from '../../mojidata/[char]/MojidataResponseView'
import LoadingArticle from '@/components/LoadingArticle'
import type { MojidataResults } from '@/mojidata/mojidataShared'
import { useSearchParams } from 'next/navigation'

export default function MojidataSpaClient(props: { char: string; lang: Language }) {
  const { char, lang } = props
  const searchParams = useSearchParams()
  const bot = searchParams.get('bot') != null
  const disableExternalLinks = searchParams.get('disableExternalLinks') === '1'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{
    results: MojidataResults
    canonicalCharacter: MojidataResults
    compatibilityCharacters?: MojidataResults[]
    isCompatibilityCharacter: boolean
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const results = await mojidataBrowser(char)
        const cjkci = results.svs_cjkci.map((record) => record.CJKCI_char)
        const isCompatibilityCharacter =
          results.svs_cjkci.length > 0 && cjkci[0] === char
        const canonicalCharacter = isCompatibilityCharacter
          ? await mojidataBrowser([...results.svs_cjkci[0].SVS_char][0])
          : results
        const compatibilityCharacters = !isCompatibilityCharacter
          ? await Promise.all(cjkci.map((c) => mojidataBrowser(c)))
          : undefined
        if (cancelled) return
        setData({
          results,
          canonicalCharacter,
          compatibilityCharacters,
          isCompatibilityCharacter,
        })
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

  if (loading) return <LoadingArticle />
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
      lang={lang}
      linkMode="server"
    />
  )
}
