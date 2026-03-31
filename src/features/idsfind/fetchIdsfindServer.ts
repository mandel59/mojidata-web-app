import 'server-only'

import { unstable_cache } from 'next/cache'
import { getRevalidateDuration } from '@/app/config'
import { version } from '@/settings'
import { mojidataApiApp } from '@/server/mojidataApiApp'
import { buildIdsfindAllResultsRequest } from '@/search/idsfindRequest'

export interface IdsFindParams {
  ids: string[]
  whole: string[]
  query: string
  page?: number
  size?: number
}

const fetchIdsFindAllResults = unstable_cache(
  async (ids: string[], whole: string[], query: string) => {
    const request = buildIdsfindAllResultsRequest({ ids, whole, query })
    const url = new URL('/api/v1/idsfind', 'http://mojidata.local')
    request.ids.forEach((value) => url.searchParams.append('ids', value))
    request.whole.forEach((value) => url.searchParams.append('whole', value))
    request.ps.forEach((p) => url.searchParams.append('p', p))
    request.qs.forEach((q) => url.searchParams.append('q', q))
    url.searchParams.set('all_results', '')

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

export async function fetchIdsFindServer(params: IdsFindParams) {
  const { ids, whole, query, page, size } = params
  const pageNum = page ?? 1
  const offset = size ? (pageNum - 1) * size : 0

  const { results, total } = await fetchIdsFindAllResults(ids, whole, query)
  const done = size ? results.length <= offset + size : true
  return { results, done, offset, size, total }
}
