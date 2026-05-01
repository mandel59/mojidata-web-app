import { readdir, stat } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultShardsDir = path.join(rootDir, '.glyph-path-shards')
const cacheControl = 'public, max-age=31536000, immutable'

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

async function listFiles(dir) {
  const files = []
  for (const entry of await readdir(dir)) {
    const fullPath = path.join(dir, entry)
    const info = await stat(fullPath)
    if (info.isDirectory()) {
      files.push(...(await listFiles(fullPath)))
    } else if (entry.endsWith('.json.gz')) {
      files.push(fullPath)
    }
  }
  return files.sort()
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

async function runPool(items, concurrency, worker) {
  let nextIndex = 0
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex++
        await worker(items[index], index)
      }
    }),
  )
}

const bucket =
  readOption('bucket') ??
  process.env.MOJIDATA_GLYPH_R2_BUCKET ??
  process.env.MOJIDATA_GLYPH_FONT_R2_BUCKET ??
  'mojidata-glyph-font-assets'
const shardsDir = path.resolve(
  readOption('dir') ?? process.env.MOJIDATA_GLYPH_PATH_SHARDS_DIR ?? defaultShardsDir,
)
const concurrency = Number.parseInt(readOption('concurrency') ?? '1', 10)

if (!Number.isInteger(concurrency) || concurrency < 1) {
  throw new Error('--concurrency must be a positive integer')
}

const files = await listFiles(shardsDir)
if (files.length === 0) {
  throw new Error(
    `No .json.gz glyph path shards found in ${shardsDir}. Run npm run cf:generate-glyph-path-shards first.`,
  )
}

console.error(`Uploading ${files.length} glyph path shards to ${bucket}`)

await runPool(files, concurrency, async (filePath, index) => {
  const objectKey = path.relative(shardsDir, filePath).split(path.sep).join('/')
  console.error(`[${index + 1}/${files.length}] ${objectKey}`)
  await run('npx', [
    'wrangler',
    'r2',
    'object',
    'put',
    `${bucket}/${objectKey}`,
    '--file',
    filePath,
    '--content-type',
    'application/gzip',
    '--cache-control',
    cacheControl,
    '--remote',
  ])
})
