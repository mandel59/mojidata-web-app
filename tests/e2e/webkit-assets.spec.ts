import { expect, test } from '@playwright/test'

test('webkit can fetch and decode SPA sqlite/wasm assets', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit', 'webkit only')

  await page.goto('/ja-JP/search-spa', { waitUntil: 'domcontentloaded' })

  const { sqlite, wasm } = await page.evaluate(async () => {
    const toHex = (bytes: Uint8Array) =>
      [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')

    const sqliteRes = await fetch('/assets/idsfind.db')
    const sqliteAb = await sqliteRes.arrayBuffer()
    const sqlitePrefix = new Uint8Array(sqliteAb.slice(0, 32))
    const sqlitePrefixText = new TextDecoder().decode(sqlitePrefix)

    const wasmRes = await fetch('/assets/sql-wasm.wasm')
    const wasmAb = await wasmRes.arrayBuffer()
    const wasmPrefix = new Uint8Array(wasmAb.slice(0, 16))

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
      wasm: {
        status: wasmRes.status,
        url: wasmRes.url,
        redirected: wasmRes.redirected,
        contentEncoding: wasmRes.headers.get('content-encoding'),
        contentType: wasmRes.headers.get('content-type'),
        prefixHex: toHex(wasmPrefix),
        byteLength: wasmAb.byteLength,
      },
    }
  })

  const sqliteOk =
    sqlite.status === 200 && sqlite.prefixText.startsWith('SQLite format 3')
  const wasmOk = wasm.status === 200 && wasm.prefixHex.startsWith('0061736d')

  if (!sqliteOk || !wasmOk) {
    await testInfo.attach('asset-debug', {
      body: JSON.stringify({ sqlite, wasm }, null, 2),
      contentType: 'application/json',
    })
  }

  expect(sqliteOk).toBeTruthy()

  expect(wasmOk).toBeTruthy()
})
