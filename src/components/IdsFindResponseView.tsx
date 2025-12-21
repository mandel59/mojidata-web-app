'use client'

import { Pager } from '@/components/Pager'
import { Spacer } from '@/components/Spacer'
import ConditionalLink from '@/components/ConditionalLink'
import GlyphWikiCharImg from '@/components/GlyphWikiCharImg'
import '@/app/[lang]/idsfind/styles.css'
import { toGlyphWikiName } from '@/glyphwiki/toGlyphWikiName'

export type IdsFindLinkMode = 'server' | 'spa'

function toRefName(char: string) {
  const charIsRef = char[0] === '&' && char[char.length - 1] === ';'
  if (charIsRef) {
    return char.slice(1, char.length - 1)
  } else {
    return `U+${char
      .codePointAt(0)
      ?.toString(16)
      .padStart(4, '0')
      .toUpperCase()}`
  }
}

function charToHref(
  char: string,
  linkMode: IdsFindLinkMode,
) {
  const charIsRef = char[0] === '&' && char[char.length - 1] === ';'
  if (charIsRef) return undefined
  const basePath = linkMode === 'spa' ? '/mojidata-spa/' : '/mojidata/'
  return `${basePath}${encodeURIComponent(char)}`
}

export interface IdsFindResponseViewProps {
  linkMode: IdsFindLinkMode
  results: string[]
  total: number
  offset: number
  size: number
  pageNum: number
  totalPages: number
  prev?: string | null
  next?: string | null
  wholeSearch: boolean
  whole?: string
  bot: boolean
  disableExternalLinks: boolean
}

export default function IdsFindResponseView(props: IdsFindResponseViewProps) {
  const {
    linkMode,
    results,
    total,
    offset,
    size,
    pageNum,
    totalPages,
    prev,
    next,
    wholeSearch,
    whole,
    bot,
    disableExternalLinks,
  } = props

  return (
    <article>
      {total > 0 && (
        <div className="ids-find-response">
          {results.slice(offset, offset + size).map((char: string) => {
            const href = charToHref(char, linkMode)
            const glyphHref = href
              ? href
              : `https://glyphwiki.org/wiki/${encodeURIComponent(
                  toGlyphWikiName(char),
                )}`
            return (
              <div
                className="ids-find-result-char ids-find-char-glyphwiki"
                lang="ja"
                key={char}
                title={toRefName(char)}
              >
                <ConditionalLink
                  prefetch={false}
                  href={href ?? glyphHref}
                  disableExternalLinks={disableExternalLinks}
                >
                  {bot ? (
                    char
                  ) : (
                    <GlyphWikiCharImg char={char} size={55} alt={char} />
                  )}
                </ConditionalLink>
              </div>
            )
          })}
          {pageNum > 1 &&
            pageNum === totalPages &&
            Array.from(Array(size - (total - offset)), (_, i) => (
              <Spacer key={i} width={60} height={60} border={1} margin={3} />
            ))}
        </div>
      )}
      {total === 0 && <p>No results found. </p>}
      {total === 0 && wholeSearch && whole && (
        <p>
          <ConditionalLink
            href={`https://zi.tools/zi/${encodeURIComponent(whole)}`}
            disableExternalLinks={disableExternalLinks}
          >
            Search zi.tools for {whole}
          </ConditionalLink>
        </p>
      )}
      <footer>
        <Pager prev={prev} next={next} pageNum={pageNum} totalPages={totalPages} />
      </footer>
    </article>
  )
}
