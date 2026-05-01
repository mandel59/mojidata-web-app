import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'
import { readFileSync } from 'node:fs'
import opentype from 'opentype.js'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultOutDir = path.join(rootDir, '.glyph-path-shards')
const r2KeyPrefix = 'glyph-paths/v1'
const shardPrefixLength = 3

const datasets = {
  jigmo: {
    indexGzPath: 'src/fonts/jigmo/glyph-index.txt.gz',
    fonts: {
      'src/fonts/jigmo/Jigmo.ttf': 'src/fonts/jigmo/Jigmo.ttf.gz',
      'src/fonts/jigmo/Jigmo2.ttf': 'src/fonts/jigmo/Jigmo2.ttf.gz',
      'src/fonts/jigmo/Jigmo3.ttf': 'src/fonts/jigmo/Jigmo3.ttf.gz',
    },
    renderBox: {
      fontSize: 1024,
      ascender: 880,
      baseline: 30,
    },
  },
  ipamjm: {
    indexGzPath: 'src/fonts/ipamjm/glyph-index.txt.gz',
    fonts: {
      'src/fonts/ipamjm/ipamjm.ttf': 'src/fonts/ipamjm/ipamjm.ttf.gz',
    },
    renderBox: {
      fontSize: 1024,
      ascender: 901,
      baseline: 0,
    },
  },
}

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

function selectedDatasetNames() {
  const source = readOption('source') ?? 'all'
  if (source === 'all') return Object.keys(datasets)
  if (source in datasets) return [source]
  throw new Error(`Unknown source: ${source}`)
}

function readIndex(indexGzPath) {
  const lines = gunzipSync(readFileSync(path.join(rootDir, indexGzPath)))
    .toString('utf8')
    .trimEnd()
    .split('\n')
    .slice(1)
  const byName = new Map()
  for (const line of lines) {
    const [fontPath, name, gid] = line.split(',')
    byName.set(name, {
      fontPath,
      name,
      gid: Number.parseInt(gid, 10),
    })
  }
  return [...byName.values()]
}

function loadFont(fontGzPath) {
  const ttf = gunzipSync(readFileSync(path.join(rootDir, fontGzPath)))
  const arrayBuffer = ttf.buffer.slice(
    ttf.byteOffset,
    ttf.byteOffset + ttf.byteLength,
  )
  return opentype.parse(arrayBuffer, { lowMemory: true })
}

function groupByShard(entries) {
  const shards = new Map()
  for (const entry of entries) {
    const shard = entry.name.slice(0, shardPrefixLength).toLowerCase()
    if (!shards.has(shard)) shards.set(shard, [])
    shards.get(shard).push(entry)
  }
  return shards
}

async function generateDataset(source, dataset, outDir) {
  const datasetOutDir = path.join(outDir, r2KeyPrefix, source)
  await rm(datasetOutDir, { recursive: true, force: true })
  await mkdir(datasetOutDir, { recursive: true })

  console.error(`[${source}] reading glyph index`)
  const entries = readIndex(dataset.indexGzPath)
  const shards = groupByShard(entries)

  const fonts = new Map()
  for (const [fontPath, fontGzPath] of Object.entries(dataset.fonts)) {
    console.error(`[${source}] parsing ${fontPath}`)
    fonts.set(fontPath, loadFont(fontGzPath))
  }

  let generated = 0
  let totalCompressedBytes = 0
  let maxCompressedBytes = 0

  for (const [shard, shardEntries] of [...shards.entries()].sort()) {
    const pathDataByName = {}
    for (const entry of shardEntries.sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const font = fonts.get(entry.fontPath)
      if (!font) {
        throw new Error(`Font not loaded: ${entry.fontPath}`)
      }
      const glyphPath = font.glyphs
        .get(entry.gid)
        .getPath(
          0,
          dataset.renderBox.ascender + dataset.renderBox.baseline,
          dataset.renderBox.fontSize,
        )
      pathDataByName[entry.name] = glyphPath.toPathData(2)
      generated++
    }

    const compressed = gzipSync(JSON.stringify(pathDataByName), { level: 9 })
    totalCompressedBytes += compressed.byteLength
    maxCompressedBytes = Math.max(maxCompressedBytes, compressed.byteLength)
    await writeFile(path.join(datasetOutDir, `${shard}.json.gz`), compressed)

    if (generated % 20000 < shardEntries.length) {
      console.error(`[${source}] generated ${generated}/${entries.length}`)
    }
  }

  console.error(
    `[${source}] wrote ${shards.size} shards, ${generated} glyphs, ${totalCompressedBytes} compressed bytes, max shard ${maxCompressedBytes} bytes`,
  )
}

const outDir = path.resolve(readOption('out') ?? defaultOutDir)
await mkdir(path.join(outDir, r2KeyPrefix), { recursive: true })

for (const source of selectedDatasetNames()) {
  await generateDataset(source, datasets[source], outDir)
}
