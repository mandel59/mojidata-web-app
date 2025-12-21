import { ReactElement } from 'react'
import './styles.css'
import { fetchIdsFind } from './idsfind'
import IdsFindResponseView from '@/components/IdsFindResponseView'

function getPrevAndNextPagePath(
  path: string,
  ids: string[],
  whole: string[],
  query: string,
  page: number,
  done: boolean,
) {
  const url = new URL(path, 'http://localhost/')
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

interface IdsFindResponseParams {
  path?: string
  langPrefix: string
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
  const {
    path = '/idsfind',
    langPrefix,
    ids,
    whole,
    query,
    page,
    bot,
    disableExternalLinks,
  } = params
  const pathWithLocale = `${langPrefix}${path}`
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
    pathWithLocale,
    ids,
    whole,
    query,
    pageNum,
    done,
  )
  return (
    <IdsFindResponseView
      langPrefix={langPrefix}
      linkMode="server"
      results={results}
      total={total}
      offset={offset}
      size={size}
      pageNum={pageNum}
      totalPages={totalPages}
      prev={prev}
      next={next}
      wholeSearch={wholeSearch}
      whole={whole[0]}
      bot={bot}
      disableExternalLinks={disableExternalLinks}
    />
  )
}
