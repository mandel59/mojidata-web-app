import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { brotliDecompressSync, gunzipSync } from 'node:zlib'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function runScript(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: rootDir,
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.stdout)
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

test('copies explicit database inputs and records them in a dry-run manifest', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'mojidata-spa-assets-'))
  try {
    const inputs = {
      'moji.db': Buffer.from('verified mojidata fixture'),
      'idsfind.db': Buffer.from('verified FTS4 fixture'),
      'idsfind-fts5.db': Buffer.from('verified FTS5 fixture'),
    }
    const inputPaths = {}
    for (const [name, value] of Object.entries(inputs)) {
      const inputPath = path.join(tempDir, `input-${name}`)
      await writeFile(inputPath, value)
      inputPaths[name] = inputPath
    }

    const mojidataPackageDir = path.join(tempDir, 'mojidata-package')
    const idsdbPackageDir = path.join(tempDir, 'idsdb-package')
    await mkdir(path.join(mojidataPackageDir, 'licenses'), { recursive: true })
    await mkdir(idsdbPackageDir, { recursive: true })
    await writeFile(path.join(mojidataPackageDir, 'LICENSE.md'), 'Mojidata license fixture')
    await writeFile(path.join(mojidataPackageDir, 'download.txt'), 'Source inventory fixture')
    await writeFile(
      path.join(mojidataPackageDir, 'licenses', 'unicode.txt'),
      'Unicode license fixture',
    )
    await writeFile(
      path.join(mojidataPackageDir, 'licenses', 'cmap-resources.txt'),
      'CMap license fixture',
    )
    await writeFile(path.join(idsdbPackageDir, 'LICENSE.md'), 'IDSDB license fixture')

    const outputDir = path.join(tempDir, 'release')
    const databaseArgs = [
      '--mojidata-db',
      inputPaths['moji.db'],
      '--idsfind-db',
      inputPaths['idsfind.db'],
      '--idsfind-fts5-db',
      inputPaths['idsfind-fts5.db'],
      '--mojidata-package-dir',
      mojidataPackageDir,
      '--idsdb-package-dir',
      idsdbPackageDir,
    ]

    runScript('scripts/copy-spa-assets.mjs', [
      '--out-dir',
      outputDir,
      ...databaseArgs,
    ])
    for (const [name, expected] of Object.entries(inputs)) {
      assert.deepEqual(await readFile(path.join(outputDir, name)), expected)
    }
    assert.equal(
      await readFile(path.join(outputDir, 'unicode-LICENSE.txt'), 'utf8'),
      'Unicode license fixture',
    )

    // SQLite updates can change content without changing the database size.
    for (const [name, value] of Object.entries(inputs)) {
      inputs[name] = Buffer.from(value.toString().toUpperCase())
      await writeFile(inputPaths[name], inputs[name])
    }

    runScript('scripts/upload-spa-assets-to-r2.mjs', [
      '--dry-run',
      '--release',
      'test-release',
      '--dir',
      outputDir,
      ...databaseArgs,
    ])

    const manifest = JSON.parse(
      await readFile(path.join(outputDir, 'manifest.json'), 'utf8'),
    )
    assert.equal(manifest.release, 'test-release')
    assert.equal(manifest.assets.length, 30)
    for (const [name, expected] of Object.entries(inputs)) {
      const asset = manifest.assets.find((entry) => entry.name === name)
      assert.equal(asset?.byteLength, expected.length)
      assert.equal(asset?.sha256, sha256(expected))
      assert.deepEqual(await readFile(path.join(outputDir, name)), expected)
      assert.deepEqual(brotliDecompressSync(await readFile(path.join(outputDir, `${name}.br`))), expected)
      assert.deepEqual(gunzipSync(await readFile(path.join(outputDir, `${name}.gz`))), expected)
    }
    assert.equal(
      manifest.notices.unicodeLicense,
      'releases/test-release/assets/unicode-LICENSE.txt',
    )
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})
