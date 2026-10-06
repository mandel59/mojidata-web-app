import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import os from 'node:os'
import path from 'node:path'
import { assertPrivateGlyphBucket, assertNoPublicGlyphAssets } from './glyph-asset-policy.mjs'

test('upload requires positively verified private R2 settings', async () => {
  const disabled = 'Public access via the r2.dev URL is disabled.\n'
  const none = 'There are no custom domains connected to this bucket.\n'
  const command = (managed, custom) => async (_node,args) => ({stdout:args.includes('dev-url')?managed:custom})
  await assertPrivateGlyphBucket('private-bucket',command(disabled,none))
  await assert.rejects(assertPrivateGlyphBucket('public-bucket',command('Public access is enabled.',none)), /r2.dev disabled/)
  await assert.rejects(assertPrivateGlyphBucket('domain-bucket',command(disabled,'Domain: glyphs.example.com')), /no custom domains/)
  await assert.rejects(assertPrivateGlyphBucket('unknown-bucket',command('Unknown response',none)), /r2.dev disabled/)
  await assert.rejects(assertPrivateGlyphBucket('private-bucket',async()=>{throw new Error('Unauthorized')}), /Unauthorized/)
})

test('public output accepts WOFF2/SVG and rejects raw fonts and renamed outlines', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(),'public-glyph-policy-'))
  try {
    await mkdir(path.join(directory,'nested'))
    await writeFile(path.join(directory,'font.woff2'),'web font')
    await writeFile(path.join(directory,'glyph.svg'),'<svg><path d="M0 0"/></svg>')
    await writeFile(path.join(directory,'ordinary.json'),'{"version":1}')
    await assertNoPublicGlyphAssets([directory,path.join(directory,'missing')])
    const raw = path.join(directory,'nested/ipamjm.ttf.gz')
    await writeFile(raw,'font')
    await assert.rejects(assertNoPublicGlyphAssets([directory]), /Private glyph asset/)
    await rm(raw)
    const shard = path.join(directory,'innocent-name.json.gz')
    await writeFile(shard,gzipSync(JSON.stringify({u3402:{pathData:'M0 0'}})))
    await assert.rejects(assertNoPublicGlyphAssets([directory]), /outline dictionary/)
  } finally { await rm(directory,{recursive:true,force:true}) }
})
