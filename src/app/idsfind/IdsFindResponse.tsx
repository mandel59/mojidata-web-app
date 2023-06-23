import { ReactElement } from 'react'
import './styles.css'
import { getApiUrl, getRevalidateDuration } from '@/app/config'
import Link from 'next/link'
import GlyphWikiChar, { toGlyphWikiName } from '@/components/GlyphWikiChar'
import { fetchIdsFind } from './idsfind'

function getPrevAndNextPagePath(
  ids: string[],
  whole: string[],
  page: number,
  done: boolean,
) {
  const url = new URL('/idsfind', 'http://localhost/')
  ids.forEach((value) => url.searchParams.append('ids', value))
  whole.forEach((value) => url.searchParams.append('whole', value))
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

interface IdsFindResponseParams {
  ids: string[]
  whole: string[]
  page?: number
}
export default async function IdsFindResponse(
  params: IdsFindResponseParams,
): Promise<ReactElement> {
  const { ids, whole, page } = params
  const size = 120
  const pageNum = page ?? 1
  const { results, done, offset } = await fetchIdsFind({
    ids,
    whole,
    page,
    size,
  })
  const { prev, next } = getPrevAndNextPagePath(ids, whole, pageNum, done)
  return (
    <div>
      <div className="ids-find-response">
        {results.slice(offset, offset + size).map((char: string) => {
          const glyphWikiName = toGlyphWikiName(char)
          return (
            <div
              className="ids-find-result-char ids-find-char-glyphwiki"
              lang="ja"
              key={char}
            >
              <Link
                prefetch={false}
                href={`/mojidata/${encodeURIComponent(char)}`}
              >
                <GlyphWikiChar name={glyphWikiName} alt={char} size={55} />
              </Link>
            </div>
          )
        })}
      </div>
      <div className="pager">
        <div>
          {prev && (
            <Link rel="prev" role="button" href={prev}>
              Prev
            </Link>
          )}
        </div>
        <div>page {pageNum}</div>
        <div>
          {next && (
            <Link rel="next" role="button" href={next}>
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
