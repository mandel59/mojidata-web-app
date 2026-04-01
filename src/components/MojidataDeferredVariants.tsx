'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getText, type Language } from '@/getText'
import DeferredCharSvgImage from '@/components/DeferredCharSvgImage'
import type { MojidataVariantEntry } from '@/components/mojidataVariantEntry'
import styles from './MojidataDeferredVariants.module.css'
import comparisonStyles from './MojidataComparison.module.css'

export interface MojidataDeferredVariantsProps {
  lang: Language
  entries: MojidataVariantEntry[]
}

export default function MojidataDeferredVariants(
  props: MojidataDeferredVariantsProps,
) {
  const { lang, entries } = props
  const [expanded, setExpanded] = useState(false)

  if (entries.length === 0) return null

  return (
    <>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.toggle}
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
        <div
          className={`${comparisonStyles.comparison} ${comparisonStyles.variantsComparison}`}
          data-testid="mojidata-variants-comparison"
        >
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
                      <DeferredCharSvgImage
                        char={entry.char}
                        size={110}
                        alt={entry.char}
                        source="glyphwiki"
                      />
                    ) : (
                      entry.char
                    )}
                  </Link>
                ) : entry.useGlyphImage ? (
                  <DeferredCharSvgImage
                    char={entry.char}
                    size={110}
                    alt={entry.char}
                    source="glyphwiki"
                  />
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
