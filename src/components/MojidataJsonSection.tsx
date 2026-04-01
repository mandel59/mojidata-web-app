'use client'

import { useState } from 'react'
import { getText, type Language } from '@/getText'

export interface MojidataJsonSectionProps {
  char: string
  lang: Language
}

export default function MojidataJsonSection(
  props: MojidataJsonSectionProps,
) {
  const { char, lang } = props
  const [jsonText, setJsonText] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const loadJson = async () => {
    if (loading || jsonText) return
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/mojidata/${encodeURIComponent(char)}`, {
        headers: {
          Accept: 'application/json',
        },
      })
      if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status}`)
      }
      const body = (await res.json()) as unknown
      setJsonText(JSON.stringify(body, null, 2))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mojidata-json-section">
      {!jsonText ? (
        <div className="mojidata-json-actions">
          <button
            type="button"
            className="mojidata-json-toggle"
            onClick={loadJson}
            disabled={loading}
          >
            {loading ? getText('json.loading', lang) : getText('json.show.button', lang)}
          </button>
          {error ? (
            <p className="mojidata-json-error">{getText('json.error', lang)}</p>
          ) : null}
        </div>
      ) : (
        <pre>{jsonText}</pre>
      )}
    </div>
  )
}
