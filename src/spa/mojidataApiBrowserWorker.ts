import { createSqlJsApiDb } from '@mandel59/mojidata-api/api/v1/_lib/mojidata-api-db-sqljs'
import { createMojidataDbProvider } from '@mandel59/mojidata-api/api/v1/_lib/mojidata-db'
import { createCachedPromise } from '@mandel59/mojidata-api/api/v1/_lib/promise-cache'
import type {
  WorkerInit,
  WorkerRequest,
  WorkerResponse,
} from '@mandel59/mojidata-api/api/v1/_lib/worker-protocol'
import initSqlJs from 'sql.js'
import type { Database, SqlJsStatic } from 'sql.js'
import {
  normalizeSpaAssetUrl,
  pruneStaleSpaAssetCache,
  readSpaAssetBytes,
} from './spaAssetCache'

let api: ReturnType<typeof createSqlJsApiDb> | undefined

const sqlJsByWasmUrl = new Map<string, Promise<SqlJsStatic>>()

function getSqlJsWeb(wasmUrl: string): Promise<SqlJsStatic> {
  const key = normalizeSpaAssetUrl(wasmUrl || 'sql-wasm.wasm')
  const existing = sqlJsByWasmUrl.get(key)
  if (existing) return existing

  const created = (async () => {
    const wasmBinary = await readSpaAssetBytes(key)
    return await initSqlJs({
      locateFile: () => key,
      wasmBinary,
    })
  })()
  sqlJsByWasmUrl.set(key, created)
  return created
}

async function openDatabaseFromCachedUrl(
  dbUrl: string,
  wasmUrl: string,
): Promise<Database> {
  const SQL = await getSqlJsWeb(wasmUrl)
  const bytes = new Uint8Array(await readSpaAssetBytes(dbUrl))
  return new SQL.Database(bytes)
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack }
  }
  return { message: String(error) }
}

async function initWorker(init: WorkerInit) {
  void pruneStaleSpaAssetCache([
    init.sqlWasmUrl,
    init.mojidataDbUrl,
    init.idsfindDbUrl,
  ]).catch(() => undefined)

  const getMojidataDb = createMojidataDbProvider(() =>
    openDatabaseFromCachedUrl(init.mojidataDbUrl, init.sqlWasmUrl),
  )
  const getIdsfindDb = createCachedPromise(() =>
    openDatabaseFromCachedUrl(init.idsfindDbUrl, init.sqlWasmUrl),
  )
  api = createSqlJsApiDb({ getMojidataDb, getIdsfindDb })
}

self.addEventListener('message', async (ev: MessageEvent) => {
  const req = ev.data as WorkerRequest
  const workerSelf = self as unknown as {
    postMessage: (message: WorkerResponse) => void
  }
  const post = (res: WorkerResponse) => workerSelf.postMessage(res)

  try {
    if (req.type === 'init') {
      await initWorker(req.init)
      post({ id: req.id, ok: true, result: null })
      return
    }

    if (!api) {
      throw new Error('Worker is not initialized; call init first.')
    }

    const { method, args } = req.call
    const result = await (api as any)[method](...args)
    post({ id: req.id, ok: true, result })
  } catch (error) {
    post({ id: req.id, ok: false, error: serializeError(error) })
  }
})
