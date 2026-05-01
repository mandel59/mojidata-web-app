import { spawn } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const assetsDir = path.join(rootDir, 'public', 'assets')
const cacheControl = 'public, max-age=31536000, immutable'

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

function normalizePrefix(prefix) {
  return prefix.trim().replace(/^\/+|\/+$/g, '')
}

function objectKey(prefix, name) {
  return [prefix, 'assets', name].filter(Boolean).join('/')
}

async function run(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
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

await import('./copy-spa-assets.mjs')

const bucket = readOption('bucket') ?? process.env.MOJIDATA_SPA_R2_BUCKET
const prefix = normalizePrefix(
  readOption('prefix') ?? process.env.MOJIDATA_SPA_R2_PREFIX ?? '',
)

if (!bucket) {
  throw new Error(
    'Set MOJIDATA_SPA_R2_BUCKET or pass --bucket <bucket> before uploading SPA assets to R2.',
  )
}

for (const asset of assets) {
  const args = [
    'wrangler',
    'r2',
    'object',
    'put',
    `${bucket}/${objectKey(prefix, asset.name)}`,
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
