'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getText, type Language } from '@/getText'
import { toGlyphWikiName } from '@/glyphwiki/toGlyphWikiName'
import type { MojidataVariantEntry } from '@/components/mojidataVariantEntry'

export interface MojidataDeferredVariantsProps {
  lang: Language
  entries: MojidataVariantEntry[]
}

function GlyphImage(props: { char: string }) {
  const { char } = props
  const name = toGlyphWikiName(char)
  const src = `/api/glyphwiki/svg/${encodeURIComponent(name)}`
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      width={110}
      height={110}
      loading="lazy"
      decoding="async"
      alt={char}
    />
  )
}

export default function MojidataDeferredVariants(
  props: MojidataDeferredVariantsProps,
) {
  const { lang, entries } = props
  const [expanded, setExpanded] = useState(false)

  if (entries.length === 0) return null

  return (
    <>
      <div className="mojidata-variants-actions">
        <button
          type="button"
          className="mojidata-variants-toggle"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded
            ? getText('variants.show-less.button', lang)
            : getText('variants.show-more.button', lang).replace(
                '{count}',
                String(entries.length),
              )}
        </button>
      </div>
      {expanded && (
        <div className="mojidata-chars-comparison mojidata-variants-comparison">
          {entries.map((entry) => (
            <figure key={entry.key}>
              <figcaption>
                <div>{entry.heading}</div>
                {entry.relationLines.map((line) => (
                  <div key={`${entry.key}:${line.label}`}>
                    <small>
                      {line.label}: {line.values}
                    </small>
                  </div>
                ))}
              </figcaption>
              <div className={entry.className}>
                {entry.href ? (
                  <Link href={entry.href} prefetch={false}>
                    {entry.useGlyphImage ? (
                      <GlyphImage char={entry.char} />
                    ) : (
                      entry.char
                    )}
                  </Link>
                ) : entry.useGlyphImage ? (
                  <GlyphImage char={entry.char} />
                ) : (
                  entry.char
                )}
              </div>
            </figure>
          ))}
        </div>
      )}
    </>
  )
}
