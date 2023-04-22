import { ReactElement } from 'react'
import './styles.css'
import { getApiUrl, getRevalidateDuration } from '@/app/config'
import Link from 'next/link'
import GlyphWikiChar, { toGlyphWikiName } from '@/components/GlyphWikiChar'

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
  const offset = (pageNum - 1) * size
  const url = new URL(getApiUrl('/api/v1/idsfind'))
  ids.forEach((value) => url.searchParams.append('ids', value))
  whole.forEach((value) => url.searchParams.append('whole', value))
  url.searchParams.set('limit', size.toString())
  url.searchParams.set('offset', offset.toString())
  const res = await fetch(url, {
    next: {
      revalidate: getRevalidateDuration(),
    },
  })
  if (!res.ok) {
    const { message } = await res.json()
    throw new Error(message)
  }
  const responseBody = await res.json()
  const { results, done } = responseBody
  const { prev, next } = getPrevAndNextPagePath(ids, whole, pageNum, done)
  return (
    <div>
      <div className="ids-find-response">
        {results.map((char: string) => {
          const glyphWikiName = toGlyphWikiName(char)
          return (
            <div
              className="ids-find-result-char ids-find-char-glyphwiki"
              key={char}
            >
              <Link href={`/mojidata/${char}`}>
                {/* @ts-expect-error Server Component */}
                <GlyphWikiChar name={glyphWikiName} alt={char} size={55} />
              </Link>
            </div>
          )
        })}
      </div>
      {prev && (
        <div>
          <Link rel="prev" href={prev}>
            Prev
          </Link>
        </div>
      )}
      {next && (
        <div>
          <Link rel="next" href={next}>
            Next
          </Link>
        </div>
      )}
    </div>
  )
}
