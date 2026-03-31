import { ReactElement } from 'react'
import '@/app/[lang]/idsfind/styles.css'
import IdsFindResponseView from '@/components/IdsFindResponseView'
import { fetchIdsFindServer } from './fetchIdsfindServer'
import { getCanonicalRoutePath } from '@/deliveryPolicy'

function getPrevAndNextPagePath(
  path: string,
  ids: string[],
  whole: string[],
  query: string,
  page: number,
  done: boolean,
  extraSearchParams?: { [key: string]: string | string[] | undefined },
) {
  const url = new URL(path, 'http://localhost/')
  if (extraSearchParams) {
    for (const [key, value] of Object.entries(extraSearchParams)) {
      if (
        value == null ||
        key === 'ids' ||
        key === 'whole' ||
        key === 'query' ||
        key === 'page'
      ) {
        continue
      }
      const values = Array.isArray(value) ? value : [value]
      for (const item of values) {
        if (item) {
          url.searchParams.append(key, item)
        }
      }
    }
  }
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

interface IdsfindResultsServerProps {
  path?: string
  ids: string[]
  whole: string[]
  query: string
  page?: number
  bot: boolean
  disableExternalLinks: boolean
  extraSearchParams?: { [key: string]: string | string[] | undefined }
}

export default async function IdsfindResultsServer(
  props: IdsfindResultsServerProps,
): Promise<ReactElement> {
  const {
    path = getCanonicalRoutePath('idsfind'),
    ids,
    whole,
    query,
    page,
    bot,
    disableExternalLinks,
    extraSearchParams,
  } = props
  const size = 50
  const pageNum = page ?? 1
  const { results, done, offset, total } = await fetchIdsFindServer({
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
    path,
    ids,
    whole,
    query,
    pageNum,
    done,
    extraSearchParams,
  )
  return (
    <IdsFindResponseView
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
      pagerPrefetch={!bot}
      resultPrefetchOnIntent={!bot}
    />
  )
}
