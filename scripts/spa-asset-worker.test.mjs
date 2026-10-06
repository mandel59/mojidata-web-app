import assert from 'node:assert/strict'
import { test } from 'node:test'
import worker from '../cloudflare/spa-asset-worker.ts'

const env = {MOJIDATA_SPA_ASSET_ORIGIN:'https://assets.example.com'}
test('nested package notices retain release paths and encoding negotiation', async () => {
  const url='https://app.example/releases/release-1/assets/mojidata/licenses/sources/mj-map-Readme.txt'
  const response=await worker.fetch(new Request(url,{headers:{'Accept-Encoding':'br'}}),env)
  assert.equal(response.status,307)
  assert.equal(response.headers.get('Location'),'https://assets.example.com/releases/release-1/assets/mojidata/licenses/sources/mj-map-Readme.txt.br')
  assert.match(response.headers.get('Cache-Control'),/immutable/)
  const raw=await worker.fetch(new Request('https://app.example/assets/idsdb/data-notices.json',{method:'HEAD'}),env)
  assert.equal(raw.headers.get('Location'),'https://assets.example.com/assets/idsdb/data-notices.json')
})
test('asset redirects reject font outlines, traversal and unrelated paths', async () => {
  for(const pathname of ['/assets/glyph-paths/v1/ipamjm/u34.json.gz','/assets/mojidata/licenses/ipamjm.ttf.gz','/assets/mojidata/licenses/%2e%2e/secret','/releases/r/assets/mojidata/arbitrary.json']) {
    const response=await worker.fetch(new Request('https://app.example'+pathname),env)
    assert.equal(response.status,404,pathname)
  }
})
