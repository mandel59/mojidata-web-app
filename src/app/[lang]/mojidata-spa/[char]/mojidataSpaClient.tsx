'use client'

import { useEffect, useState } from 'react'
import { mojidataBrowser } from '@/spa/mojidataApiBrowser'

export default function MojidataSpaClient(props: { char: string }) {
  const { char } = props
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const r = await mojidataBrowser(char)
        if (cancelled) return
        setResults(r)
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

  if (loading) return <p>Loading...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (!results) return <p>No results.</p>

  const ids: string[] = Array.isArray(results.ids)
    ? results.ids.map((x: any) => x?.IDS).filter(Boolean)
    : []

  return (
    <div>
      <h2>
        {results.char} ({results.UCS})
      </h2>
      {ids.length > 0 && (
        <div>
          <h3>IDS</h3>
          <ul>
            {ids.slice(0, 10).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      )}
      <details>
        <summary>Raw JSON</summary>
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(results, null, 2)}
        </pre>
      </details>
    </div>
  )
}

