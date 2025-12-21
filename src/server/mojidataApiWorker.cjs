const fs = require("node:fs")
const path = require("node:path")
const { createRequire } = require("node:module")
const { parentPort } = require("node:worker_threads")

if (!parentPort) {
  throw new Error("This module must be run as a worker thread")
}

const nodeRequire = createRequire(__filename)

function joinModulePath(...parts) {
  return parts.join("/")
}

function resolvePnpVirtualPath(filePath) {
  if (!path.isAbsolute(filePath)) return filePath
  try {
    const pnp = nodeRequire("pnpapi")
    return (pnp.resolveVirtual && pnp.resolveVirtual(filePath)) || filePath
  } catch {
    return filePath
  }
}

let sqlJsPromise
async function getSqlJsNode() {
  sqlJsPromise ||= (() => {
    const wasmPath = resolvePnpVirtualPath(
      nodeRequire.resolve(joinModulePath("sql.js", "dist", "sql-wasm.wasm")),
    )
    const initSqlJs = nodeRequire("sql.js")
    return initSqlJs({
      locateFile: () => wasmPath,
    })
  })()
  return sqlJsPromise
}

async function openDatabaseFromFile(filePath) {
  const SQL = await getSqlJsNode()
  const realPath = resolvePnpVirtualPath(filePath)
  const bytes = fs.readFileSync(realPath)
  return new SQL.Database(new Uint8Array(bytes))
}

function createNodeDb() {
  const { createSqlJsApiDb } = nodeRequire(
    "@mandel59/mojidata-api/api/v1/_lib/mojidata-api-db-sqljs",
  )
  const { createMojidataDbProvider } = nodeRequire(
    "@mandel59/mojidata-api/api/v1/_lib/mojidata-db",
  )
  const { createCachedPromise } = nodeRequire(
    "@mandel59/mojidata-api/api/v1/_lib/promise-cache",
  )

  const mojidataDbPath = nodeRequire.resolve(
    joinModulePath("@mandel59/mojidata", "dist", "moji.db"),
  )
  const idsfindDbPath = nodeRequire.resolve(
    joinModulePath("@mandel59/idsdb", "idsfind.db"),
  )

  const getMojidataDb = createMojidataDbProvider(() =>
    openDatabaseFromFile(mojidataDbPath),
  )
  const getIdsfindDb = createCachedPromise(() => openDatabaseFromFile(idsfindDbPath))
  return createSqlJsApiDb({ getMojidataDb, getIdsfindDb })
}

const db = createNodeDb()

function serializeError(err) {
  if (!err || typeof err !== "object") {
    return { message: String(err) }
  }
  return {
    message: String(err.message || err),
    stack: typeof err.stack === "string" ? err.stack : undefined,
    name: typeof err.name === "string" ? err.name : undefined,
  }
}

parentPort.on("message", async (msg) => {
  const { id, method, args } = msg || {}
  try {
    if (typeof id !== "number") throw new Error("Invalid id")
    if (typeof method !== "string") throw new Error("Invalid method")
    if (!Array.isArray(args)) throw new Error("Invalid args")

    const fn = db[method]
    if (typeof fn !== "function") {
      throw new Error(`Unknown method: ${method}`)
    }
    const result = await fn.apply(db, args)
    parentPort.postMessage({ id, ok: true, result })
  } catch (err) {
    parentPort.postMessage({ id, ok: false, error: serializeError(err) })
  }
})

