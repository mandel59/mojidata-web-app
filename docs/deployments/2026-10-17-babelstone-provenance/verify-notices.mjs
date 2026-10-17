import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

const [baseUrl, output] = process.argv.slice(2)
assert(baseUrl && output, 'Usage: node verify-notices.mjs <base-url> <output.json>')
const release = 'r20261017-babelstone-provenance'
const manifestBytes = await readFile('dist/spa-assets/manifest.json')
const manifest = JSON.parse(manifestBytes)
assert.equal(manifest.release, release)
const origin = 'https://pub-71ea5f978f41419c8fbd653a44326929.r2.dev'
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
const checks = []

for (const locale of ['ja-JP', 'en-US']) {
  const response = await fetch(new URL(`/${locale}/license`, baseUrl))
  assert.equal(response.status, 200)
  const html = await response.text()
  for (const {name, version} of manifest.notices.packages) {
    assert(html.includes(`${name} ${version}`), `Missing package heading: ${name}`)
  }
  for (const name of ['Kawabata Taichi', 'John Knightley', 'Michel Mariani']) {
    assert(html.includes(name), `Missing contributor: ${name}`)
  }
  checks.push({path: `/${locale}/license`, status: response.status, packagesAndContributors: true})
}

for (const {name} of manifest.notices.packages) {
  const packageName = name.split('/')[1]
  for (const suffix of ['', '.br', '.gz']) {
    const path = `${packageName}/licenses/babelstone-ids.txt${suffix}`
    const url = suffix ? `${origin}/releases/${release}/assets/${path}` : new URL(`/assets/${path}`, baseUrl)
    const response = await fetch(url)
    assert.equal(response.status, 200)
    assert(new URL(response.url).pathname.includes(`/releases/${release}/`))
    const actual = Buffer.from(await response.arrayBuffer())
    const expected = await readFile(`node_modules/${name}/licenses/babelstone-ids.txt`)
    assert(actual.equals(expected), `Notice bytes differ: ${path}`)
    checks.push({path: `/assets/${path}`, status: response.status, finalUrl: response.url, decodedSha256: sha256(actual)})
  }
}

for (const name of ['moji.db', 'idsfind.db', 'idsfind-fts5.db', 'sqlite3.wasm', 'sql-wasm.wasm']) {
  const response = await fetch(new URL(`/assets/${name}`, baseUrl), {
    method: 'HEAD', headers: {'Accept-Encoding': 'identity'},
  })
  assert.equal(response.status, 200)
  assert(new URL(response.url).pathname.includes(`/releases/${release}/`))
  // Cloudflare may negotiate Brotli and omit Content-Length on HEAD responses.
  // Check the raw object's size and prefix using a small range request instead.
  const raw = await fetch(`${origin}/releases/${release}/assets/${name}`, {headers: {Range: 'bytes=0-63'}})
  assert.equal(raw.status, 206)
  const byteLength = manifest.assets.find(asset => asset.name === name).byteLength
  assert.equal(raw.headers.get('content-range'), `bytes 0-63/${byteLength}`)
  assert(Buffer.from(await raw.arrayBuffer()).equals((await readFile(`dist/spa-assets/${name}`)).subarray(0, 64)))
  checks.push({path: `/assets/${name}`, method: 'HEAD', status: response.status, finalUrl: response.url, rawRangeStatus: raw.status, rawByteLength: byteLength})
}

const manifestUrl = `${origin}/releases/${release}/manifest.json`
const response = await fetch(manifestUrl)
assert.equal(response.status, 200)
assert(Buffer.from(await response.arrayBuffer()).equals(manifestBytes), 'Remote manifest differs')
checks.push({url: manifestUrl, sha256: sha256(manifestBytes), status: response.status})
const report = {checkedAt: new Date().toISOString(), baseUrl, release, checks, remoteD1Requests: 0}
await writeFile(output, JSON.stringify(report, null, 2) + '\n')
console.log(`Verified ${checks.length} static page, notice, database/Wasm HEAD and manifest checks on ${baseUrl}`)
