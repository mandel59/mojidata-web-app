import { getApiUrl, getRevalidateDuration } from '../config'

export interface SearchParams {
  query: string
  page?: number
  size?: number
}

export function parseQuery(query: string) {
  return (query.match(/\S+/gu) ?? [])
    .map((p): [string, string] | undefined => {
      if (p.startsWith('U+')) return ['UCS', p.slice(2)]
      if (p.startsWith('MJ')) return ['mji.MJ文字図形名', p]
      if (p[0] === '=' || p[0] === '＝') {
        return ['mji.総画数', p.normalize('NFKC').slice(1)]
      }
      if (p.slice(0, 2).normalize('NFKC') === '<=') {
        return ['mji.総画数.le', p.normalize('NFKC').slice(2)]
      }
      if (p[0] === '<' || p[0] === '＜') {
        return ['mji.総画数.lt', p.normalize('NFKC').slice(1)]
      }
      if (p.slice(0, 2).normalize('NFKC') === '>=') {
        return ['mji.総画数.ge', p.normalize('NFKC').slice(2)]
      }
      if (p[0] === '>' || p[0] === '＞') {
        return ['mji.総画数.gt', p.normalize('NFKC').slice(1)]
      }
      if (p.normalize('NFKC').match(/^\d{1,2}$/u)) {
        return ['mji.総画数', p.normalize('NFKC')]
      }
      if (p.match(/^[\p{sc=Kana}\p{sc=Hira}ー]+$/u)) {
        return ['mji.読み', p]
      }
      if (p.match(/^[\p{sc=Kana}\p{sc=Hira}ー]+[*＊]$/u)) {
        return ['mji.読み.prefix', p.substring(0, p.length - 1)]
      }
      if (p.match(/^\p{sc=Han}[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]?$/u)) {
        return ['UCS', p.codePointAt(0)!.toString(16)]
      }
    })
    .filter((x): x is [string, string] => typeof x === 'object')
}

export function unzip(pairs: [string, string][]) {
  const ps = []
  const qs = []
  for (const [p, q] of pairs) {
    ps.push(p)
    qs.push(q)
  }
  return [ps, qs] as const
}

export async function fetchSearch(params: SearchParams) {
  const { query, page, size } = params
  const pageNum = page ?? 1
  const offset = size ? (pageNum - 1) * size : 0
  const url = new URL(getApiUrl('/api/v1/idsfind'))
  const pqs = parseQuery(query)
  if (pqs.length === 0) {
    return { results: [], done: true, offset, size: 0, total: 0 }
  }
  const [ps, qs] = unzip(pqs)
  ps.forEach((value) => url.searchParams.append('p', value))
  qs.forEach((value) => url.searchParams.append('q', value))
  const res = await fetch(url, {
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
  const { results } = responseBody as {
    results: string[]
    total: number
  }
  const done = size ? results.length <= offset + size : true
  const total = results.length
  return { results, done, offset, size, total }
}
