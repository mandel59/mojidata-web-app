'use client'

import { createApp } from '@mandel59/mojidata-api/app'
import { createMojidataApiWorkerClient } from '@mandel59/mojidata-api/browser-client'

type MojidataApiApp = ReturnType<typeof createApp>

const defaultAssets = {
  sqlWasmUrl: '/assets/sql-wasm.wasm',
  mojidataDbUrl: '/assets/moji.db',
  idsfindDbUrl: '/assets/idsfind.db',
}

let apiPromise:
  | Promise<{
      app: MojidataApiApp
      terminate: () => void
    }>
  | undefined

export async function getMojidataApiBrowser() {
  apiPromise ??= (async () => {
    const worker = new Worker(
      new URL('./mojidataApiBrowserWorker.ts', import.meta.url),
      { type: 'module' },
    )
    const db = createMojidataApiWorkerClient(worker, defaultAssets)
    await db.ready
    const app = createApp(db)
    return { app, terminate: () => db.terminate() }
  })()
  return await apiPromise
}

export async function mojidataBrowser(char: string) {
  const { app } = await getMojidataApiBrowser()
  const url = new URL('/api/v1/mojidata', 'http://mojidata.local')
  url.searchParams.set('char', char)
  const res = await app.fetch(
    new Request(url, {
      headers: {
        Accept: 'application/json',
      },
    }),
  )
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
  }
  const body = (await res.json()) as { results: unknown | null }
  if (!body.results) {
    throw new Error(`No results for char: ${char}`)
  }
  return body.results as any
}

export async function idsfindBrowserAllResults(params: {
  ids: string[]
  whole: string[]
  ps: string[]
  qs: string[]
}) {
  const { app } = await getMojidataApiBrowser()
  const url = new URL('/api/v1/idsfind', 'http://mojidata.local')
  params.ids.forEach((value) => url.searchParams.append('ids', value))
  params.whole.forEach((value) => url.searchParams.append('whole', value))
  params.ps.forEach((p) => url.searchParams.append('p', p))
  params.qs.forEach((q) => url.searchParams.append('q', q))
  url.searchParams.set('all_results', '1')

  const res = await app.fetch(
    new Request(url, {
      headers: {
        Accept: 'application/json',
      },
    }),
  )
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
  }
  const body = (await res.json()) as { results: string[]; total?: number }
  return { results: body.results, total: body.total ?? body.results.length }
}

