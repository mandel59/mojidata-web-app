import 'server-only'

import fs from 'node:fs'
import path from 'node:path'

type MojidataApiApp = { fetch: (request: Request) => Promise<Response> }
type SqlJsStatic = { Database: new (bytes: Uint8Array) => unknown }

const { createRequire } = require('node:module') as typeof import('node:module')
const nodeRequire = createRequire(__filename)

function joinModulePath(...parts: string[]) {
  return parts.join('/')
}

function resolvePnpVirtualPath(filePath: string) {
  if (!path.isAbsolute(filePath)) return filePath
  try {
    const pnp = nodeRequire('pnpapi') as {
      resolveVirtual?: (p: string) => string | null
    }
    return pnp.resolveVirtual?.(filePath) ?? filePath
  } catch {
    return filePath
  }
}

let sqlJsPromise: Promise<SqlJsStatic> | undefined
async function getSqlJsNode(): Promise<SqlJsStatic> {
  sqlJsPromise ??= (() => {
    const wasmPath = resolvePnpVirtualPath(
      nodeRequire.resolve(joinModulePath('sql.js', 'dist', 'sql-wasm.wasm')),
    )
    const initSqlJs = nodeRequire('sql.js') as (opts: {
      locateFile: () => string
    }) => Promise<SqlJsStatic>
    return initSqlJs({
      locateFile: () => wasmPath,
    })
  })()
  return sqlJsPromise
}

async function openDatabaseFromFile(filePath: string): Promise<unknown> {
  const SQL = await getSqlJsNode()
  const realPath = resolvePnpVirtualPath(filePath)
  const bytes = fs.readFileSync(realPath)
  return new SQL.Database(new Uint8Array(bytes))
}

function createNodeDb() {
  const { createSqlJsApiDb } = require(
    '@mandel59/mojidata-api/api/v1/_lib/mojidata-api-db-sqljs',
  ) as {
    createSqlJsApiDb: (args: {
      getMojidataDb: () => Promise<unknown>
      getIdsfindDb: () => Promise<unknown>
    }) => unknown
  }
  const { createMojidataDbProvider } = require(
    '@mandel59/mojidata-api/api/v1/_lib/mojidata-db',
  ) as {
    createMojidataDbProvider: (
      openDatabase: () => Promise<unknown>,
    ) => () => Promise<unknown>
  }
  const { createCachedPromise } = require(
    '@mandel59/mojidata-api/api/v1/_lib/promise-cache',
  ) as {
    createCachedPromise: <T>(factory: () => Promise<T>) => () => Promise<T>
  }

  const mojidataDbPath = nodeRequire.resolve(
    joinModulePath('@mandel59/mojidata', 'dist', 'moji.db'),
  )
  const idsfindDbPath = nodeRequire.resolve(
    joinModulePath('@mandel59/idsdb', 'idsfind.db'),
  )

  const getMojidataDb = createMojidataDbProvider(() =>
    openDatabaseFromFile(mojidataDbPath),
  )
  const getIdsfindDb = createCachedPromise(() =>
    openDatabaseFromFile(idsfindDbPath),
  )
  return createSqlJsApiDb({ getMojidataDb, getIdsfindDb })
}

export const mojidataApiApp: MojidataApiApp = (() => {
  const { createApp } = require('@mandel59/mojidata-api/app') as {
    createApp: (db: unknown) => MojidataApiApp
  }
  return createApp(createNodeDb())
})()
