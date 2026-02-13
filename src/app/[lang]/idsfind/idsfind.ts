import 'server-only'

import { getRevalidateDuration } from '../../config'
import { parseQuery } from '../search/search'
import { version } from '@/settings'
import { mojidataApiApp } from '@/server/mojidataApiApp'
import { unstable_cache } from 'next/cache'

export interface IdsFindParams {
  ids: string[]
  whole: string[]
  query: string
  page?: number
  size?: number
}

function normalize(s: string) {
  const vsPattern = /[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/gu
  return s.normalize('NFC').replace(vsPattern, '')
}

const fetchIdsFindAllResults = unstable_cache(
  async (ids: string[], whole: string[], query: string) => {
    const { ps, qs, ids: ids2, whole: whole2 } = parseQuery(query)
    const url = new URL('/api/v1/idsfind', 'http://mojidata.local')
    void [...ids, ...ids2]
      .map(normalize)
      .forEach((value) => url.searchParams.append('ids', value))
    void [...whole, ...whole2]
      .map(normalize)
      .forEach((value) => url.searchParams.append('whole', value))
    ps.forEach((p) => url.searchParams.append('p', p))
    qs.forEach((q) => url.searchParams.append('q', q))
    url.searchParams.set('all_results', '1')

    const res = await mojidataApiApp.fetch(
      new Request(url, {
        headers: {
          Accept: 'application/json',
        },
      }),
    )
    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.statusText}, url: ${url.href}`)
    }
    const responseBody = await res.json()
    const { results, total } = responseBody as {
      results: string[]
      total?: number
    }
    return { results, total: total ?? results.length }
  },
  ['fetchIdsFindAllResults', version],
  { revalidate: getRevalidateDuration() },
)

export async function fetchIdsFind(params: IdsFindParams) {
  const { ids, whole, query, page, size } = params
  const pageNum = page ?? 1
  const offset = size ? (pageNum - 1) * size : 0

  const { results, total } = await fetchIdsFindAllResults(ids, whole, query)
  const done = size ? results.length <= offset + size : true
  return { results, done, offset, size, total }
}
