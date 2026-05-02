import { expect, test } from './fixtures'

test('webkit can fetch and decode SPA sqlite/wasm assets', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit', 'webkit only')

  await page.goto('/ja-JP/search-spa', { waitUntil: 'domcontentloaded' })

  const { sqlite, sqliteFts5, wasm, sqliteWasm } = await page.evaluate(async () => {
    const toHex = (bytes: Uint8Array) =>
      [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')

    const sqliteRes = await fetch('/assets/idsfind.db')
    const sqliteAb = await sqliteRes.arrayBuffer()
    const sqlitePrefix = new Uint8Array(sqliteAb.slice(0, 32))
    const sqlitePrefixText = new TextDecoder().decode(sqlitePrefix)

    const sqliteFts5Res = await fetch('/assets/idsfind-fts5.db')
    const sqliteFts5Ab = await sqliteFts5Res.arrayBuffer()
    const sqliteFts5Prefix = new Uint8Array(sqliteFts5Ab.slice(0, 32))
    const sqliteFts5PrefixText = new TextDecoder().decode(sqliteFts5Prefix)

    const wasmRes = await fetch('/assets/sql-wasm.wasm')
    const wasmAb = await wasmRes.arrayBuffer()
    const wasmPrefix = new Uint8Array(wasmAb.slice(0, 16))

    const sqliteWasmRes = await fetch('/assets/sqlite3.wasm')
    const sqliteWasmAb = await sqliteWasmRes.arrayBuffer()
    const sqliteWasmPrefix = new Uint8Array(sqliteWasmAb.slice(0, 16))

    return {
      sqlite: {
        status: sqliteRes.status,
        url: sqliteRes.url,
        redirected: sqliteRes.redirected,
        contentEncoding: sqliteRes.headers.get('content-encoding'),
        contentType: sqliteRes.headers.get('content-type'),
        prefixHex: toHex(sqlitePrefix),
        prefixText: sqlitePrefixText,
        byteLength: sqliteAb.byteLength,
      },
      sqliteFts5: {
        status: sqliteFts5Res.status,
        url: sqliteFts5Res.url,
        redirected: sqliteFts5Res.redirected,
        contentEncoding: sqliteFts5Res.headers.get('content-encoding'),
        contentType: sqliteFts5Res.headers.get('content-type'),
        prefixHex: toHex(sqliteFts5Prefix),
        prefixText: sqliteFts5PrefixText,
        byteLength: sqliteFts5Ab.byteLength,
      },
      wasm: {
        status: wasmRes.status,
        url: wasmRes.url,
        redirected: wasmRes.redirected,
        contentEncoding: wasmRes.headers.get('content-encoding'),
        contentType: wasmRes.headers.get('content-type'),
        prefixHex: toHex(wasmPrefix),
        byteLength: wasmAb.byteLength,
      },
      sqliteWasm: {
        status: sqliteWasmRes.status,
        url: sqliteWasmRes.url,
        redirected: sqliteWasmRes.redirected,
        contentEncoding: sqliteWasmRes.headers.get('content-encoding'),
        contentType: sqliteWasmRes.headers.get('content-type'),
        prefixHex: toHex(sqliteWasmPrefix),
        byteLength: sqliteWasmAb.byteLength,
      },
    }
  })

  const sqliteOk =
    sqlite.status === 200 && sqlite.prefixText.startsWith('SQLite format 3')
  const sqliteFts5Ok =
    sqliteFts5.status === 200 &&
    sqliteFts5.prefixText.startsWith('SQLite format 3')
  const wasmOk = wasm.status === 200 && wasm.prefixHex.startsWith('0061736d')
  const sqliteWasmOk =
    sqliteWasm.status === 200 && sqliteWasm.prefixHex.startsWith('0061736d')

  if (!sqliteOk || !sqliteFts5Ok || !wasmOk || !sqliteWasmOk) {
    await testInfo.attach('asset-debug', {
      body: JSON.stringify({ sqlite, sqliteFts5, wasm, sqliteWasm }, null, 2),
      contentType: 'application/json',
    })
  }

  expect(sqliteOk).toBeTruthy()
  expect(sqliteFts5Ok).toBeTruthy()

  expect(wasmOk).toBeTruthy()
  expect(sqliteWasmOk).toBeTruthy()
})
