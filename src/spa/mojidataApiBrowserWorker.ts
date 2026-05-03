import { createSqlApiDb, type MojidataApiDb } from '@mandel59/mojidata-api/core'
import { installMojidataSqlFunctions } from '@mandel59/mojidata-api-core'
import { createMojidataDbProvider } from '@mandel59/mojidata-api-sqljs/lib/mojidata-db'
import { createSqlJsExecutor } from '@mandel59/mojidata-api-sqljs/lib/sqljs-executor'
import type {
  WorkerInit,
  WorkerRequest,
  WorkerResponse,
} from '@mandel59/mojidata-api-runtime/lib/worker-protocol'
import { createSqliteWasmExecutor } from '@mandel59/mojidata-api-sqlite-wasm/lib/sqlite-wasm-executor'
import {
  ensureOpfsSAHPoolDatabase,
  getSqliteWasm,
  installOpfsSAHPool,
  isOpfsSAHPoolSupported,
  type OpfsSAHPoolMaterializeOptions,
  type SqliteWasmSAHPoolUtil,
} from '@mandel59/mojidata-api-sqlite-wasm/lib/opfs-sahpool'
import type { Database as SqliteWasmDatabase } from '@sqlite.org/sqlite-wasm'
import initSqlJs from 'sql.js'
import type { Database, SqlJsStatic } from 'sql.js'
import {
  normalizeSpaAssetUrl,
  pruneStaleSpaAssetCache,
  readSpaAssetBytes,
} from './spaAssetCache'

type SqliteWasmWorkerInit = WorkerInit & {
  sqliteWasm?: {
    wasmUrl?: string
    wasmBinary?: ArrayBuffer | Uint8Array
    idsfindDbUrl?: string
    opfsName?: string
    opfsDirectory?: string
    initialCapacity?: number
    clearOnInit?: boolean
    manifestDirectory?: string
    mojidataDbName?: string
    idsfindDbName?: string
    mojidataDbVersion?: string
    idsfindDbVersion?: string
    mojidataDbByteLength?: number
    idsfindDbByteLength?: number
  }
}

type BackendKind = 'opfs-sahpool' | 'sqljs'

let api: MojidataApiDb | undefined
let currentInit: SqliteWasmWorkerInit | undefined
let currentBackend: BackendKind | undefined
let fallbackApiPromise: Promise<MojidataApiDb> | undefined

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

function createCachedPromise<T>(factory: () => Promise<T>) {
  let promise: Promise<T> | undefined
  return () => {
    promise ??= factory()
    return promise
  }
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack }
  }
  return { message: String(error) }
}

function sqliteWasmAssetUrl(init: SqliteWasmWorkerInit) {
  return init.sqliteWasm?.wasmUrl ?? '/assets/sqlite3.wasm'
}

function sqliteWasmIdsfindAssetUrl(init: SqliteWasmWorkerInit) {
  return init.sqliteWasm?.idsfindDbUrl ?? init.idsfindDbUrl
}

function cachedAssetFetch(input: string) {
  return readSpaAssetBytes(input).then(
    (bytes) => new Response(bytes, { status: 200 }),
  )
}

function installMojidataSqliteWasmFunctions(db: SqliteWasmDatabase) {
  installMojidataSqlFunctions((name, fn) => {
    db.createFunction({
      name,
      arity: fn.length,
      deterministic: true,
      innocuous: true,
      xFunc: (_ctxPtr, ...args) =>
        (fn as (...values: unknown[]) => any)(...args),
    })
  })
}

function openOpfsSAHPoolDatabase(
  poolUtil: SqliteWasmSAHPoolUtil,
  name: string,
) {
  const db = new poolUtil.OpfsSAHPoolDb(name, 'r')
  db.exec('PRAGMA temp_store=memory')
  return db
}

function createSqliteWasmMojidataDbProvider(
  openDatabase: () => Promise<SqliteWasmDatabase>,
) {
  let dbPromise: Promise<ReturnType<typeof createSqliteWasmExecutor>> | undefined
  return function getMojidataDb() {
    dbPromise ??= openDatabase().then((db) => {
      installMojidataSqliteWasmFunctions(db)
      return createSqliteWasmExecutor(db)
    })
    return dbPromise
  }
}

function createSqliteWasmExecutorProvider(
  openDatabase: () => Promise<SqliteWasmDatabase>,
) {
  let dbPromise: Promise<ReturnType<typeof createSqliteWasmExecutor>> | undefined
  return function getDb() {
    dbPromise ??= openDatabase().then((db) => createSqliteWasmExecutor(db))
    return dbPromise
  }
}

async function openEnsuredOpfsDatabase(
  poolUtil: SqliteWasmSAHPoolUtil,
  options: OpfsSAHPoolMaterializeOptions,
) {
  await ensureOpfsSAHPoolDatabase(poolUtil, options)
  return openOpfsSAHPoolDatabase(poolUtil, options.name)
}

function createOpfsApi(init: SqliteWasmWorkerInit) {
  if (!isOpfsSAHPoolSupported()) {
    throw new Error('OPFS SAH pool is not available in this worker.')
  }

  const manifestDirectory = init.sqliteWasm?.manifestDirectory
  const mojidata: OpfsSAHPoolMaterializeOptions = {
    name: init.sqliteWasm?.mojidataDbName ?? '/mojidata/moji.db',
    assetUrl: normalizeSpaAssetUrl(init.mojidataDbUrl),
    assetVersion:
      init.sqliteWasm?.mojidataDbVersion ??
      normalizeSpaAssetUrl(init.mojidataDbUrl),
    byteLength: init.sqliteWasm?.mojidataDbByteLength,
    manifestDirectory,
    fetch: cachedAssetFetch,
  }
  const idsfind: OpfsSAHPoolMaterializeOptions = {
    name: init.sqliteWasm?.idsfindDbName ?? '/mojidata/idsfind.db',
    assetUrl: normalizeSpaAssetUrl(sqliteWasmIdsfindAssetUrl(init)),
    assetVersion:
      init.sqliteWasm?.idsfindDbVersion ??
      normalizeSpaAssetUrl(sqliteWasmIdsfindAssetUrl(init)),
    byteLength: init.sqliteWasm?.idsfindDbByteLength,
    manifestDirectory,
    fetch: cachedAssetFetch,
  }

  const getPoolUtil = createCachedPromise(async () => {
    const wasmUrl = normalizeSpaAssetUrl(sqliteWasmAssetUrl(init))
    const sqlite3 = await getSqliteWasm({
      wasmUrl,
      wasmBinary:
        init.sqliteWasm?.wasmBinary ?? (await readSpaAssetBytes(wasmUrl)),
    })
    return await installOpfsSAHPool(sqlite3, {
      name: init.sqliteWasm?.opfsName,
      directory: init.sqliteWasm?.opfsDirectory,
      initialCapacity: init.sqliteWasm?.initialCapacity ?? 8,
      clearOnInit: init.sqliteWasm?.clearOnInit,
    })
  })

  return createSqlApiDb({
    getMojidataDb: createSqliteWasmMojidataDbProvider(async () =>
      openEnsuredOpfsDatabase(await getPoolUtil(), mojidata),
    ),
    getIdsfindDb: createSqliteWasmExecutorProvider(async () =>
      openEnsuredOpfsDatabase(await getPoolUtil(), idsfind),
    ),
  })
}

function createSqlJsIdsfindDbProvider(init: WorkerInit) {
  const sqlWasmUrl = normalizeSpaAssetUrl(init.sqlWasmUrl)
  return createCachedPromise(() =>
    openDatabaseFromCachedUrl(init.idsfindDbUrl, sqlWasmUrl).then((db) =>
      createSqlJsExecutor(db),
    ),
  )
}

async function createSqlJsApi(init: WorkerInit) {
  const sqlWasmUrl = normalizeSpaAssetUrl(init.sqlWasmUrl)
  void pruneStaleSpaAssetCache([
    sqlWasmUrl,
    normalizeSpaAssetUrl(init.mojidataDbUrl),
    normalizeSpaAssetUrl(init.idsfindDbUrl),
  ]).catch(() => undefined)
  const getMojidataDb = createMojidataDbProvider(() =>
    openDatabaseFromCachedUrl(init.mojidataDbUrl, sqlWasmUrl),
  )
  const getIdsfindDb = createSqlJsIdsfindDbProvider(init)
  return createSqlApiDb({ getMojidataDb, getIdsfindDb })
}

async function getFallbackApi(init: SqliteWasmWorkerInit) {
  fallbackApiPromise ??= createSqlJsApi(init)
  return await fallbackApiPromise
}

async function initWorker(init: SqliteWasmWorkerInit) {
  currentInit = init
  fallbackApiPromise = undefined

  void pruneStaleSpaAssetCache([
    init.sqlWasmUrl,
    sqliteWasmAssetUrl(init),
    init.mojidataDbUrl,
    init.idsfindDbUrl,
    sqliteWasmIdsfindAssetUrl(init),
  ]).catch(() => undefined)

  try {
    api = await createOpfsApi(init)
    currentBackend = 'opfs-sahpool'
  } catch (error) {
    api = await getFallbackApi(init)
    currentBackend = 'sqljs'
  }
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
    let result: unknown
    try {
      result = await (api as any)[method](...args)
    } catch (error) {
      if (!currentInit || currentBackend !== 'opfs-sahpool') {
        throw error
      }
      api = await getFallbackApi(currentInit)
      currentBackend = 'sqljs'
      result = await (api as any)[method](...args)
    }
    post({ id: req.id, ok: true, result })
  } catch (error) {
    post({ id: req.id, ok: false, error: serializeError(error) })
  }
})
