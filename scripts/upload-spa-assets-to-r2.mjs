import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultAssetsDir = path.join(rootDir, 'dist', 'spa-assets')
const releaseAssetCacheControl = 'public, max-age=31536000, immutable'
const legacyAssetCacheControl = 'public, max-age=300, must-revalidate'

const assets = [
  { name: 'sql-wasm.wasm', contentType: 'application/wasm' },
  {
    name: 'sql-wasm.wasm.br',
    contentType: 'application/wasm',
    contentEncoding: 'br',
  },
  {
    name: 'sql-wasm.wasm.gz',
    contentType: 'application/wasm',
    contentEncoding: 'gzip',
  },
  { name: 'sqlite3.wasm', contentType: 'application/wasm' },
  {
    name: 'sqlite3.wasm.br',
    contentType: 'application/wasm',
    contentEncoding: 'br',
  },
  {
    name: 'sqlite3.wasm.gz',
    contentType: 'application/wasm',
    contentEncoding: 'gzip',
  },
  { name: 'moji.db', contentType: 'application/octet-stream' },
  {
    name: 'moji.db.br',
    contentType: 'application/octet-stream',
    contentEncoding: 'br',
  },
  {
    name: 'moji.db.gz',
    contentType: 'application/octet-stream',
    contentEncoding: 'gzip',
  },
  { name: 'idsfind.db', contentType: 'application/octet-stream' },
  {
    name: 'idsfind.db.br',
    contentType: 'application/octet-stream',
    contentEncoding: 'br',
  },
  {
    name: 'idsfind.db.gz',
    contentType: 'application/octet-stream',
    contentEncoding: 'gzip',
  },
  { name: 'idsfind-fts5.db', contentType: 'application/octet-stream' },
  {
    name: 'idsfind-fts5.db.br',
    contentType: 'application/octet-stream',
    contentEncoding: 'br',
  },
  {
    name: 'idsfind-fts5.db.gz',
    contentType: 'application/octet-stream',
    contentEncoding: 'gzip',
  },
]

function readOption(name) {
  const flag = `--${name}`
  const index = process.argv.indexOf(flag)
  if (index === -1) return undefined
  const value = process.argv[index + 1]
  if (!value || value.startsWith('--')) {
    throw new Error(`${flag} requires a value`)
  }
  return value
}

function readFlag(name) {
  return process.argv.includes(`--${name}`)
}

function normalizePrefix(prefix) {
  return prefix.trim().replace(/^\/+|\/+$/g, '')
}

function normalizeRelease(release) {
  const value = release.trim()
  if (!value) return ''
  if (!/^[A-Za-z0-9._-]+$/.test(value)) {
    throw new Error(
      `SPA asset release must use only letters, numbers, dot, underscore, or hyphen: ${value}`,
    )
  }
  return value
}

function objectKey(...segments) {
  return segments.filter(Boolean).join('/')
}

function assetObjectKey(prefix, release, name) {
  if (release) return objectKey(prefix, 'releases', release, 'assets', name)
  return [prefix, 'assets', name].filter(Boolean).join('/')
}

function manifestObjectKey(prefix, release) {
  return objectKey(prefix, 'releases', release, 'manifest.json')
}

async function run(command, args, options = {}) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: options.stdio ?? 'inherit',
    })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with ${code}`))
      }
    })
  })
}

async function commandSucceeds(command, args) {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: 'ignore',
    })
    child.on('error', reject)
    child.on('exit', (code) => resolve(code === 0))
  })
}

async function sha256(filePath) {
  const data = await readFile(filePath)
  return createHash('sha256').update(data).digest('hex')
}

async function manifestForRelease({ assetsDir, prefix, release }) {
  const manifestAssets = await Promise.all(
    assets.map(async (asset) => {
      const filePath = path.join(assetsDir, asset.name)
      const info = await stat(filePath)
      return {
        name: asset.name,
        key: assetObjectKey(prefix, release, asset.name),
        contentType: asset.contentType,
        ...(asset.contentEncoding
          ? { contentEncoding: asset.contentEncoding }
          : {}),
        byteLength: info.size,
        sha256: await sha256(filePath),
      }
    }),
  )

  return {
    version: 1,
    release,
    createdAt: new Date().toISOString(),
    prefix,
    assets: manifestAssets,
  }
}

const bucket = readOption('bucket') ?? process.env.MOJIDATA_SPA_R2_BUCKET
const assetsDir = path.resolve(
  readOption('dir') ?? process.env.MOJIDATA_SPA_ASSETS_DIR ?? defaultAssetsDir,
)
const prefix = normalizePrefix(
  readOption('prefix') ?? process.env.MOJIDATA_SPA_R2_PREFIX ?? '',
)
const release = normalizeRelease(
  readOption('release') ?? process.env.MOJIDATA_SPA_ASSET_RELEASE ?? '',
)
const legacyStable =
  readFlag('legacy-stable') || process.env.MOJIDATA_SPA_R2_LEGACY_STABLE === '1'
const force = readFlag('force') || process.env.MOJIDATA_SPA_R2_FORCE === '1'

process.env.MOJIDATA_SPA_ASSETS_DIR = assetsDir
await import('./copy-spa-assets.mjs')

if (!bucket) {
  throw new Error(
    'Set MOJIDATA_SPA_R2_BUCKET or pass --bucket <bucket> before uploading SPA assets to R2.',
  )
}

if (!release && !legacyStable) {
  throw new Error(
    [
      'Refusing to upload mutable stable SPA asset keys by default.',
      'Pass --release <release-id> or set MOJIDATA_SPA_ASSET_RELEASE to upload immutable release assets.',
      'Pass --legacy-stable only for an explicit legacy /assets/* refresh.',
    ].join('\n'),
  )
}

if (release && !force) {
  const exists = await commandSucceeds('npx', [
    'wrangler',
    'r2',
    'object',
    'get',
    `${bucket}/${manifestObjectKey(prefix, release)}`,
    '--pipe',
    '--remote',
  ])
  if (exists) {
    throw new Error(
      `SPA asset release already exists: ${manifestObjectKey(prefix, release)}. Pass --force to overwrite.`,
    )
  }
}

const cacheControl = release ? releaseAssetCacheControl : legacyAssetCacheControl

for (const asset of assets) {
  const args = [
    'wrangler',
    'r2',
    'object',
    'put',
    `${bucket}/${assetObjectKey(prefix, release, asset.name)}`,
    '--file',
    path.join(assetsDir, asset.name),
    '--content-type',
    asset.contentType,
    '--cache-control',
    cacheControl,
    '--remote',
  ]

  if (asset.contentEncoding) {
    args.push('--content-encoding', asset.contentEncoding)
  }

  await run('npx', args)
}

if (release) {
  const manifestPath = path.join(assetsDir, 'manifest.json')
  await writeFile(
    manifestPath,
    `${JSON.stringify(await manifestForRelease({ assetsDir, prefix, release }), null, 2)}\n`,
  )
  await run('npx', [
    'wrangler',
    'r2',
    'object',
    'put',
    `${bucket}/${manifestObjectKey(prefix, release)}`,
    '--file',
    manifestPath,
    '--content-type',
    'application/json; charset=utf-8',
    '--cache-control',
    releaseAssetCacheControl,
    '--remote',
  ])
}
