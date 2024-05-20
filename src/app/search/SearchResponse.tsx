import { ReactElement } from 'react'
import './styles.css'
import Link from 'next/link'
import GlyphWikiChar, { toGlyphWikiName } from '@/components/GlyphWikiChar'
import { fetchSearch } from './search'
import ConditionalLink from '@/components/ConditionalLink'
import { Pager } from '@/components/Pager'
import { Spacer } from '@/components/Spacer'

function getPrevAndNextPagePath(query: string, page: number, done: boolean) {
  const url = new URL('/search', 'http://localhost/')
  url.searchParams.set('query', query)
  let prevUrl: URL | undefined
  if (page > 1) {
    prevUrl = new URL(url)
    if (page > 2) {
      prevUrl.searchParams.set('page', (page - 1).toString())
    }
  }
  let nextUrl: URL | undefined
  if (!done) {
    nextUrl = new URL(url)
    nextUrl.searchParams.set('page', (page + 1).toString())
  }
  return {
    prev: prevUrl && prevUrl.pathname + prevUrl.search,
    next: nextUrl && nextUrl.pathname + nextUrl.search,
  }
}

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

interface SearchResponseParams {
  query: string
  page?: number
}
export default async function SearchResponse(
  params: SearchResponseParams,
): Promise<ReactElement> {
  const { query, page } = params
  const size = 120
  const pageNum = page ?? 1
  const { results, done, offset, total } = await fetchSearch({
    query,
    page,
    size,
  })
  const totalPages = Math.ceil(total / size)
  const { prev, next } = getPrevAndNextPagePath(query, pageNum, done)
  return (
    <article>
      {total > 0 && (
        <div className="search-response">
          {results.slice(offset, offset + size).map((char: string) => {
            const glyphWikiName = toGlyphWikiName(char)
            const charIsRef = char[0] === '&' && char[char.length - 1] === ';'
            // TODO: Make pages for reference characters
            const href = charIsRef
              ? `https://glyphwiki.org/wiki/${glyphWikiName}`
              : `/mojidata/${encodeURIComponent(char)}`
            return (
              <div
                className="search-result-char search-char-glyphwiki"
                lang="ja"
                key={char}
                title={toRefName(char)}
              >
                <ConditionalLink prefetch={false} href={href}>
                  <GlyphWikiChar name={glyphWikiName} alt={char} size={55} />
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
      <footer>
        <Pager
          prev={prev}
          next={next}
          pageNum={pageNum}
          totalPages={totalPages}
        />
      </footer>
    </article>
  )
}
