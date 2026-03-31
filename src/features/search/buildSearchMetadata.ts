import type { Metadata } from 'next'
import {
  getCanonicalRoutePath,
  getLocalizedCanonicalRoutePath,
} from '@/deliveryPolicy'

export function buildSearchMetadata(params: {
  query: string | undefined
  page: string | string[] | undefined
}): Metadata {
  const { query, page } = params

  function buildLocalePath(locale: string) {
    const url = new URL(
      `https://mojidata.ryusei.dev${getLocalizedCanonicalRoutePath('search', locale)}`,
    )
    if (query != null) url.searchParams.append('query', String(query))
    if (page != null) url.searchParams.append('page', String(page))
    return url.pathname + url.search
  }

  function buildCanonicalPath() {
    const url = new URL(
      `https://mojidata.ryusei.dev${getCanonicalRoutePath('search')}`,
    )
    if (query != null) url.searchParams.append('query', String(query))
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
