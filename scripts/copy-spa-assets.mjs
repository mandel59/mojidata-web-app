import { copyFile, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(rootDir, 'public', 'assets')

const assets = [
  {
    src: path.join(rootDir, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
    dest: path.join(outDir, 'sql-wasm.wasm'),
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
]

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

await mkdir(outDir, { recursive: true })

let copiedCount = 0
let totalBytes = 0
for (const { src, dest } of assets) {
  const { copied, bytes } = await copyIfNeeded(src, dest)
  totalBytes += bytes
  if (copied) copiedCount += 1
}

if (process.env.CI) {
  console.log(
    `[spa-assets] ensured ${assets.length} files (copied ${copiedCount}, total ${totalBytes} bytes)`,
  )
}
