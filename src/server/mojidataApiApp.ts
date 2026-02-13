import 'server-only'

import fs from 'node:fs'
import path from 'node:path'
import { Worker } from 'node:worker_threads'

type MojidataApiApp = { fetch: (request: Request) => Promise<Response> }
type MojidataApiDb = {
  getMojidataJson: (char: string, select: string[]) => Promise<string | null>
  idsfind: (idslist: string[]) => Promise<string[]>
  search: (ps: string[], qs: string[]) => Promise<string[]>
  filterChars: (chars: string[], ps: string[], qs: string[]) => Promise<string[]>
}

type WorkerRequest = { id: number; method: keyof MojidataApiDb; args: unknown[] }
type WorkerResponse =
  | { id: number; ok: true; result: unknown }
  | { id: number; ok: false; error: { message: string; stack?: string } }

function resolveWorkerPath(): string {
  const candidates = [
    path.join(process.cwd(), 'src/server/mojidataApiWorker.cjs'),
    path.join(process.cwd(), 'mojidataApiWorker.cjs'),
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }
  return candidates[0]
}

function createWorkerDb(): MojidataApiDb {
  let worker: Worker | undefined
  let nextId = 1
  const pending = new Map<
    number,
    { resolve: (v: any) => void; reject: (e: Error) => void }
  >()

  const rejectAll = (err: Error) => {
    for (const { reject } of pending.values()) reject(err)
    pending.clear()
  }

  const ensureWorker = () => {
    if (worker) return worker
    const workerPath = resolveWorkerPath()
    worker = new Worker(workerPath)
    worker.on('message', (msg: WorkerResponse) => {
      const handler = pending.get(msg.id)
      if (!handler) return
      pending.delete(msg.id)
      if (msg.ok) {
        handler.resolve(msg.result)
        return
      }
      const err = new Error(msg.error.message)
      if (msg.error.stack) err.stack = msg.error.stack
      handler.reject(err)
    })
    worker.on('error', (err) => {
      rejectAll(err instanceof Error ? err : new Error(String(err)))
      worker = undefined
    })
    worker.on('exit', (code) => {
      if (code !== 0) {
        rejectAll(new Error(`mojidata worker exited: ${code}`))
      }
      worker = undefined
    })
    return worker
  }

  const call = <TResult>(method: keyof MojidataApiDb, args: unknown[]) => {
    const id = nextId++
    return new Promise<TResult>((resolve, reject) => {
      pending.set(id, { resolve: resolve as (v: any) => void, reject })
      const w = ensureWorker()
      w.postMessage({ id, method, args } satisfies WorkerRequest)
    })
  }

  return {
    getMojidataJson: (char, select) =>
      call<string | null>('getMojidataJson', [char, select]),
    idsfind: (idslist) => call<string[]>('idsfind', [idslist]),
    search: (ps, qs) => call<string[]>('search', [ps, qs]),
    filterChars: (chars, ps, qs) => call<string[]>('filterChars', [chars, ps, qs]),
  }
}

export const mojidataApiApp: MojidataApiApp = (() => {
  const { createApp } = require('@mandel59/mojidata-api/app') as {
    createApp: (db: MojidataApiDb) => MojidataApiApp
  }
  return createApp(createWorkerDb())
})()
