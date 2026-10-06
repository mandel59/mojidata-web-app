import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { packageNoticeAssets } from './data-notice-assets.mjs'

test('rejects tampered, missing and unsafe notices before distribution', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'data-notice-validation-'))
  try {
    await mkdir(path.join(directory, 'licenses'))
    await writeFile(path.join(directory, 'package.json'), JSON.stringify({name:'@mandel59/fixture', version:'1.0.0'}))
    const text = 'original notice'
    const manifest = {version:1,package:'@mandel59/fixture',resources:[{licenseFile:'licenses/terms.txt',noticeFiles:['licenses/terms.txt']}],noticeFiles:{'licenses/terms.txt':{sha256:createHash('sha256').update(text).digest('hex')}}}
    const save = () => writeFile(path.join(directory,'data-notices.json'),JSON.stringify(manifest))
    await save()
    await assert.rejects(packageNoticeAssets(directory,'@mandel59/fixture','fixture'), /ENOENT/)
    await writeFile(path.join(directory,'licenses/terms.txt'),'modified notice')
    await assert.rejects(packageNoticeAssets(directory,'@mandel59/fixture','fixture'), /hash mismatch/)
    await writeFile(path.join(directory,'licenses/terms.txt'),text)
    assert.equal((await packageNoticeAssets(directory,'@mandel59/fixture','fixture')).files.length,3)
    manifest.resources[0].licenseFile='licenses/not-listed.txt'
    await save()
    await assert.rejects(packageNoticeAssets(directory,'@mandel59/fixture','fixture'), /Unlisted notice/)
    manifest.resources=[]
    manifest.noticeFiles={'licenses/../../secret.txt':{sha256:'0'.repeat(64)}}
    await save()
    await assert.rejects(packageNoticeAssets(directory,'@mandel59/fixture','fixture'), /Invalid notice path/)
  } finally { await rm(directory,{recursive:true,force:true}) }
})
