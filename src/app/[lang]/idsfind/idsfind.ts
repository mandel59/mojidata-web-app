import { customFetch } from '@/customFetch'
import { getApiUrl, getRevalidateDuration } from '../../config'
import { parseQuery } from '../search/search'

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

export async function fetchIdsFind(params: IdsFindParams) {
  const { ids, whole, query, page, size } = params
  const pageNum = page ?? 1
  const offset = size ? (pageNum - 1) * size : 0
  const { ps, qs, ids: ids2, whole: whole2 } = parseQuery(query)
  const url = new URL(getApiUrl('/api/v1/idsfind'))
  void [...ids, ...ids2]
    .map(normalize)
    .forEach((value) => url.searchParams.append('ids', value))
  void [...whole, ...whole2]
    .map(normalize)
    .forEach((value) => url.searchParams.append('whole', value))
  ps.forEach((p) => url.searchParams.append('p', p))
  qs.forEach((q) => url.searchParams.append('q', q))
  url.searchParams.set('all_results', '1')
  const res = await customFetch(url, {
    next: {
      revalidate: getRevalidateDuration(),
    },
    headers: {
      Accept: 'application/json',
    },
  })
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.statusText}, url: ${url.href}`)
  }
  const responseBody = await res.json()
  const { results, total } = responseBody as {
    results: string[]
    total?: number
  }
  const done = size ? results.length <= offset + size : true
  return { results, done, offset, size, total: total ?? results.length }
}
