import 'server-only'

import { getRevalidateDuration } from '@/app/config'
import { version } from '@/settings'
import { mojidataApiApp } from '@/server/mojidataApiApp'
import { unstable_cache } from 'next/cache'

export * from '@/mojidata/mojidataShared'

import type { MojidataResults } from '@/mojidata/mojidataShared'

export const fetchMojidata = unstable_cache(
  async (char: string) => {
    const url = new URL('/api/v1/mojidata', 'http://mojidata.local')
    url.searchParams.set('char', char)

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
    const { results }: { results: MojidataResults | null } = responseBody
    if (!results) {
      throw new Error(`No results for char: ${char}`)
    }
    return results
  },
  ['fetchMojidata', version],
  { revalidate: getRevalidateDuration() },
)

