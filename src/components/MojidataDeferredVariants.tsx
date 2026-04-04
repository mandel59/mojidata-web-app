'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getText, type Language } from '@/getText'
import DeferredCharSvgImage from '@/components/DeferredCharSvgImage'
import type { MojidataVariantEntry } from '@/components/mojidataVariantEntry'
import MojidataDeferredVariantsView from './MojidataDeferredVariantsView'

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
    <MojidataDeferredVariantsView
      entries={entries}
      expanded={expanded}
      toggleLabel={
        expanded
          ? getText('variants.show-less.button', lang)
          : getText('variants.show-more.button', lang).replace(
              '{count}',
              String(entries.length),
            )
      }
      onToggle={() => setExpanded((value) => !value)}
      renderEntryContent={(entry) =>
        entry.href ? (
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
        )
      }
    />
  )
}
