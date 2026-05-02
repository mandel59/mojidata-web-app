import { expect, test } from './fixtures'

test('chromium fetches Brotli SPA assets and receives decoded bytes', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'chromium only')

  await page.goto('/ja-JP/search-spa', { waitUntil: 'domcontentloaded' })

  const assets = await page.evaluate(async () => {
    async function readAsset(pathname: string) {
      const response = await fetch(pathname)
      const bytes = new Uint8Array(await response.arrayBuffer())
      return {
        status: response.status,
        contentEncoding: response.headers.get('content-encoding'),
        contentLength: response.headers.get('content-length'),
        prefixText: new TextDecoder().decode(bytes.slice(0, 32)),
        prefixHex: [...bytes.slice(0, 16)]
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(''),
      }
    }

    return {
      mojidata: await readAsset('/assets/moji.db'),
      idsfind: await readAsset('/assets/idsfind.db'),
      wasm: await readAsset('/assets/sql-wasm.wasm'),
    }
  })

  expect(assets.mojidata.status).toBe(200)
  expect(assets.mojidata.contentEncoding).toBe('br')
  expect(Number(assets.mojidata.contentLength)).toBeLessThan(97_308_672)
  expect(assets.mojidata.prefixText).toContain('SQLite format 3')

  expect(assets.idsfind.status).toBe(200)
  expect(assets.idsfind.contentEncoding).toBe('br')
  expect(Number(assets.idsfind.contentLength)).toBeLessThan(32_757_760)
  expect(assets.idsfind.prefixText).toContain('SQLite format 3')

  expect(assets.wasm.status).toBe(200)
  expect(assets.wasm.contentEncoding).toBe('br')
  expect(Number(assets.wasm.contentLength)).toBeLessThan(659_123)
  expect(assets.wasm.prefixHex).toMatch(/^0061736d/)
})

test('webkit keeps DB assets raw and still decodes compressed wasm', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit', 'webkit only')

  await page.goto('/ja-JP/search-spa', { waitUntil: 'domcontentloaded' })

  const assets = await page.evaluate(async () => {
    async function readAsset(pathname: string) {
      const response = await fetch(pathname)
      const bytes = new Uint8Array(await response.arrayBuffer())
      return {
        status: response.status,
        contentEncoding: response.headers.get('content-encoding'),
        contentLength: response.headers.get('content-length'),
        prefixText: new TextDecoder().decode(bytes.slice(0, 32)),
        prefixHex: [...bytes.slice(0, 16)]
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(''),
      }
    }

    return {
      idsfind: await readAsset('/assets/idsfind.db'),
      wasm: await readAsset('/assets/sql-wasm.wasm'),
    }
  })

  expect(assets.idsfind.status).toBe(200)
  expect(assets.idsfind.contentEncoding).toBeNull()
  expect(Number(assets.idsfind.contentLength)).toBeGreaterThan(7_084_191)
  expect(assets.idsfind.prefixText).toContain('SQLite format 3')

  expect(assets.wasm.status).toBe(200)
  expect(['br', 'gzip']).toContain(assets.wasm.contentEncoding)
  expect(Number(assets.wasm.contentLength)).toBeLessThan(659_123)
  expect(assets.wasm.prefixHex).toMatch(/^0061736d/)
})
