import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { writeFile } from 'node:fs/promises'

const require = createRequire(`${process.cwd()}/package.json`)
const { chromium } = require('@playwright/test')
const [baseUrl, outputPath] = process.argv.slice(2)
assert.ok(baseUrl && outputPath)
const browser = await chromium.launch({ headless: true })
const checks = []
try {
  for (const char of ['鐥', '充']) {
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.addInitScript(() => {
      window.__mojidataResults = []
      window.__mojidataWorkerUrls = []
      const NativeWorker = window.Worker
      window.Worker = class extends NativeWorker {
        constructor(url, options) {
          super(url, options)
          window.__mojidataWorkerUrls.push(String(url))
          this.addEventListener('message', event => {
            if (!event.data?.ok || typeof event.data.result !== 'string') return
            try {
              const result = JSON.parse(event.data.result)
              if (result?.char) window.__mojidataResults.push(result)
            } catch {}
          })
        }
      }
    })
    const response = await page.goto(`${baseUrl}/ja-JP/mojidata-spa/${encodeURIComponent(char)}`, { waitUntil: 'domcontentloaded' })
    assert.equal(response.status(), 200)
    await page.getByTestId('mojidata-response').waitFor({ timeout: 60000 })
    await page.waitForFunction(char => window.__mojidataResults.some(result => result.char === char), char, { timeout: 60000 })
    const { result, workerUrls } = await page.evaluate(char => ({ result: window.__mojidataResults.find(result => result.char === char), workerUrls: window.__mojidataWorkerUrls }), char)
    let verified
    if (char === '鐥') {
      const row = result.mji.find(row => row.MJ文字図形名 === 'MJ068046')
      assert.equal(row.mjsm_note, '国字:みずかね')
      verified = { MJ文字図形名: row.MJ文字図形名, mjsm_note: row.mjsm_note }
    } else {
      const row = result.kdpv_comment.find(row => row.subject === '充' && row.object === '𠑽' && row.comment === '[充=⿱亠厶]')
      assert.ok(row)
      verified = row
    }
    assert.deepEqual(errors, [])
    checks.push({ char, status: response.status(), verified, workerUrls, pageErrors: errors })
    await page.close()
  }
  await writeFile(outputPath, JSON.stringify({ observedAt: new Date().toISOString(), baseUrl, checks }, null, 2) + '\n')
  console.log(`Verified both new API note fields from actual SPA Worker responses at ${baseUrl}`)
} finally {
  await browser.close()
}
