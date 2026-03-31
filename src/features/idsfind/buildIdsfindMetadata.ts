import type { Metadata } from 'next'
import {
  appendArraySearchParams,
  castToArray,
  castToString,
} from '@/app/[lang]/searchParams'
import {
  getCanonicalRoutePath,
  getLocalizedCanonicalRoutePath,
} from '@/deliveryPolicy'

export function buildIdsfindMetadata(
  params: Record<string, string | string[] | undefined>,
): Metadata {
  const { ids, whole, query, page } = params

  function buildLocalePath(locale: string) {
    const url = new URL(
      `https://mojidata.ryusei.dev${getLocalizedCanonicalRoutePath('idsfind', locale)}`,
    )
    appendArraySearchParams(url, 'ids', castToArray(ids))
    appendArraySearchParams(url, 'whole', castToArray(whole))
    const queryString = castToString(query)
    if (queryString) url.searchParams.append('query', queryString)
    if (page != null) url.searchParams.append('page', String(page))
    return url.pathname + url.search
  }

  function buildCanonicalPath() {
    const url = new URL(
      `https://mojidata.ryusei.dev${getCanonicalRoutePath('idsfind')}`,
    )
    appendArraySearchParams(url, 'ids', castToArray(ids))
    appendArraySearchParams(url, 'whole', castToArray(whole))
    const queryString = castToString(query)
    if (queryString) url.searchParams.append('query', queryString)
    if (page != null) url.searchParams.append('page', String(page))
    return url.pathname + url.search
  }

  return {
    alternates: {
      canonical: buildCanonicalPath(),
      languages: {
        'en-US': buildLocalePath('en-US'),
        'ja-JP': buildLocalePath('ja-JP'),
      },
    },
  }
}
