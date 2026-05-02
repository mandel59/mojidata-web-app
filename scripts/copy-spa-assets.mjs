import { createReadStream, createWriteStream } from 'node:fs'
import { copyFile, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'
import { constants, createBrotliCompress, createGzip } from 'node:zlib'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultOutDir = path.join(rootDir, 'dist', 'spa-assets')

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

const outDir = path.resolve(
  readOption('out-dir') ?? process.env.MOJIDATA_SPA_ASSETS_DIR ?? defaultOutDir,
)

function idsfindFts5DbSource() {
  const override = process.env.MOJIDATA_SPA_IDSFIND_FTS5_DB_SOURCE?.trim()
  if (override) return path.resolve(override)

  return path.join(
    rootDir,
    'node_modules',
    '@mandel59',
    'idsdb-fts5',
    'idsfind.db',
  )
}

const assets = [
  {
    src: path.join(rootDir, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
    dest: path.join(outDir, 'sql-wasm.wasm'),
  },
  {
    src: path.join(
      rootDir,
      'node_modules',
      '@sqlite.org',
      'sqlite-wasm',
      'dist',
      'sqlite3.wasm',
    ),
    dest: path.join(outDir, 'sqlite3.wasm'),
  },
  {
    src: path.join(
      rootDir,
      'node_modules',
      '@mandel59',
      'mojidata',
      'dist',
      'moji.db',
    ),
    dest: path.join(outDir, 'moji.db'),
  },
  {
    src: path.join(
      rootDir,
      'node_modules',
      '@mandel59',
      'idsdb',
      'idsfind.db',
    ),
    dest: path.join(outDir, 'idsfind.db'),
  },
  {
    src: idsfindFts5DbSource(),
    dest: path.join(outDir, 'idsfind-fts5.db'),
  },
]

if (process.env.MOJIDATA_SKIP_SPA_ASSETS === '1') {
  if (process.env.CI) {
    console.log('[spa-assets] skipped because MOJIDATA_SKIP_SPA_ASSETS=1')
  }
  process.exit(0)
}

async function copyIfNeeded(src, dest) {
  let srcStat
  try {
    srcStat = await stat(src)
  } catch {
    throw new Error(`Missing required asset source: ${src}`)
  }

  try {
    const destStat = await stat(dest)
    if (destStat.size === srcStat.size) return { copied: false, bytes: destStat.size }
  } catch {
    // not present
  }

  await copyFile(src, dest)
  return { copied: true, bytes: srcStat.size }
}

async function compressIfNeeded(src, dest, compress) {
  const srcStat = await stat(src)
  try {
    const destStat = await stat(dest)
    if (destStat.size > 0 && destStat.mtimeMs >= srcStat.mtimeMs) {
      return { compressed: false, bytes: destStat.size }
    }
  } catch {
    // not present
  }

  await pipeline(createReadStream(src), compress(), createWriteStream(dest))
  const destStat2 = await stat(dest)
  return { compressed: true, bytes: destStat2.size }
}

await mkdir(outDir, { recursive: true })

let copiedCount = 0
let totalBytes = 0
let compressedCount = 0
let totalCompressedBytes = 0
for (const { src, dest } of assets) {
  const { copied, bytes } = await copyIfNeeded(src, dest)
  totalBytes += bytes
  if (copied) copiedCount += 1

  const brotli = await compressIfNeeded(dest, `${dest}.br`, () =>
    createBrotliCompress({
      params: {
        [constants.BROTLI_PARAM_QUALITY]: 7,
        [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_GENERIC,
      },
    }),
  )
  totalCompressedBytes += brotli.bytes
  if (brotli.compressed) compressedCount += 1

  const gzip = await compressIfNeeded(dest, `${dest}.gz`, () =>
    createGzip({ level: 9 }),
  )
  totalCompressedBytes += gzip.bytes
  if (gzip.compressed) compressedCount += 1
}

if (process.env.CI) {
  console.log(
    `[spa-assets] ensured ${assets.length} files (copied ${copiedCount}, total ${totalBytes} bytes; compressed ${compressedCount}, total ${totalCompressedBytes} bytes)`,
  )
}
