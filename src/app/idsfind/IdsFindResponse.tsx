import { ReactElement } from 'react'
import './styles.css'
import GlyphWikiChar, { toGlyphWikiName } from '@/components/GlyphWikiChar'
import { fetchIdsFind } from './idsfind'
import ConditionalLink from '@/components/ConditionalLink'
import { Pager } from '@/components/Pager'
import { Spacer } from '@/components/Spacer'

function getPrevAndNextPagePath(
  ids: string[],
  whole: string[],
  query: string,
  page: number,
  done: boolean,
) {
  const url = new URL('/idsfind', 'http://localhost/')
  ids.forEach((value) => url.searchParams.append('ids', value))
  whole.forEach((value) => url.searchParams.append('whole', value))
  if (query) url.searchParams.set('query', query)
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

interface IdsFindResponseParams {
  ids: string[]
  whole: string[]
  query: string
  page?: number
  bot: boolean
  disableExternalLinks: boolean
}
export default async function IdsFindResponse(
  params: IdsFindResponseParams,
): Promise<ReactElement> {
  const { ids, whole, query, page, bot, disableExternalLinks } = params
  const size = 50
  const pageNum = page ?? 1
  const { results, done, offset, total } = await fetchIdsFind({
    ids,
    whole,
    query,
    page,
    size,
  })
  const totalPages = Math.ceil(total / size)
  const wholeSearch =
    ids.length === 0 && whole.length === 1 && !/[a-z？]/.test(whole[0])
  const { prev, next } = getPrevAndNextPagePath(
    ids,
    whole,
    query,
    pageNum,
    done,
  )
  return (
    <article>
      {total > 0 && (
        <div className="ids-find-response">
          {results.slice(offset, offset + size).map((char: string) => {
            const glyphWikiName = toGlyphWikiName(char)
            const charIsRef = char[0] === '&' && char[char.length - 1] === ';'
            // TODO: Make pages for reference characters
            const href = charIsRef
              ? `https://glyphwiki.org/wiki/${glyphWikiName}`
              : `/mojidata/${encodeURIComponent(char)}`
            return (
              <div
                className="ids-find-result-char ids-find-char-glyphwiki"
                lang="ja"
                key={char}
                title={toRefName(char)}
              >
                <ConditionalLink
                  prefetch={false}
                  href={href}
                  disableExternalLinks={disableExternalLinks}
                >
                  <GlyphWikiChar
                    name={glyphWikiName}
                    alt={char}
                    size={55}
                    bot={bot}
                  />
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
      {total === 0 && wholeSearch && (
        <p>
          <ConditionalLink
            href={`https://zi.tools/zi/${encodeURIComponent(whole[0])}`}
            disableExternalLinks={disableExternalLinks}
          >
            Search zi.tools for {whole[0]}
          </ConditionalLink>
        </p>
      )}
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
