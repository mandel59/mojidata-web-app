import { parseQuery } from './parseQuery'
import { normalizeSearchChar } from './shared'

export interface IdsfindAllResultsRequest {
  ids: string[]
  whole: string[]
  ps: string[]
  qs: string[]
}

export function buildIdsfindAllResultsRequest(params: {
  ids: string[]
  whole: string[]
  query: string
}): IdsfindAllResultsRequest {
  const { ids, whole, query } = params
  const parsed = parseQuery(query)
  return {
    ids: [...ids, ...parsed.ids].map(normalizeSearchChar),
    whole: [...whole, ...parsed.whole].map(normalizeSearchChar),
    ps: parsed.ps,
    qs: parsed.qs,
  }
}
