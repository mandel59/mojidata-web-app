import { Pager } from '@/components/Pager'
import { Spacer } from '@/components/Spacer'
import ConditionalLink from '@/components/ConditionalLink'
import GlyphWikiCharImg from '@/components/GlyphWikiCharImg'
import IntentPrefetchLink from '@/components/IntentPrefetchLink'
import dividerStyles from '@/components/SectionDivider.module.css'
import surfaceStyles from '@/components/Surface.module.css'
import { cn } from '@/lib/utils'
import { toGlyphWikiName } from '@/glyphwiki/toGlyphWikiName'
import styles from './IdsFindResponseView.module.css'

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

function charToHref(char: string) {
  const charIsRef = char[0] === '&' && char[char.length - 1] === ';'
  if (charIsRef) return undefined
  return `/mojidata/${encodeURIComponent(char)}`
}

export interface IdsFindResponseViewProps {
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
  pagerPrefetch?: boolean
  resultPrefetchOnIntent?: boolean
}

export default function IdsFindResponseView(props: IdsFindResponseViewProps) {
  const {
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
    pagerPrefetch,
    resultPrefetchOnIntent,
  } = props

  return (
    <article className={cn(surfaceStyles.cardSurface, styles.article)}>
      {total > 0 && (
        <div className={styles.results}>
          {results.map((char: string) => {
            const href = charToHref(char)
            const glyphHref = href
              ? href
              : `https://glyphwiki.org/wiki/${encodeURIComponent(
                  toGlyphWikiName(char),
                )}`
            return (
              <div
                className={cn(
                  surfaceStyles.interactiveTileBase,
                  surfaceStyles.interactiveTileHover,
                  styles.resultChar,
                )}
                lang="ja"
                key={char}
                title={toRefName(char)}
              >
                <IntentPrefetchLink
                  href={href ?? glyphHref}
                  disableExternalLinks={disableExternalLinks}
                  prefetchOnIntent={!!href && resultPrefetchOnIntent}
                  className={`${styles.resultLink} ${styles.resultGlyphImage}`}
                >
                  {bot ? (
                    char
                  ) : (
                    <GlyphWikiCharImg char={char} size={55} alt={char} />
                  )}
                </IntentPrefetchLink>
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
      {total === 0 && <p className={styles.empty}>No results found.</p>}
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
      <footer className={dividerStyles.dividerTop}>
        <Pager
          prev={prev}
          next={next}
          pageNum={pageNum}
          totalPages={totalPages}
          prefetch={pagerPrefetch}
        />
      </footer>
    </article>
  )
}
