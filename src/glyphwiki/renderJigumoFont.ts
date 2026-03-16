import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { gunzip } from 'node:zlib'
import { promisify } from 'node:util'
import opentype from 'opentype.js'

const jigmoIndexGz = join(process.cwd(), 'src/fonts/jigmo/glyph-index.txt.gz')

const jigmoGz = join(process.cwd(), 'src/fonts/jigmo/Jigmo.ttf.gz')
const jigmo2Gz = join(process.cwd(), 'src/fonts/jigmo/Jigmo2.ttf.gz')
const jigmo3Gz = join(process.cwd(), 'src/fonts/jigmo/Jigmo3.ttf.gz')

const do_gunzip = promisify(gunzip)

async function loadFontFromGz(gzPath: string): Promise<opentype.Font> {
  const gzBuffer = await readFile(gzPath)
  const ttfBuffer = await do_gunzip(gzBuffer)
  return opentype.parse(
    ttfBuffer.buffer.slice(
      ttfBuffer.byteOffset,
      ttfBuffer.byteOffset + ttfBuffer.byteLength,
    ),
  )
}

async function loadIndexFromGz(
  gzPath: string,
): Promise<Map<string, [string, number]>> {
  const gzBuffer = await readFile(gzPath)
  const txtBuffer = await do_gunzip(gzBuffer)
  const decoder = new TextDecoder()
  const index = new Map()
  for (const line of decoder.decode(txtBuffer).split('\n')) {
    if (!line) continue
    const [fontPath, name, gid] = line.split(',')
    index.set(name, [fontPath, Number.parseInt(gid, 10)])
  }
  return index
}

const [jigmo, jigmo2, jigmo3, index] = await Promise.all([
  loadFontFromGz(jigmoGz),
  loadFontFromGz(jigmo2Gz),
  loadFontFromGz(jigmo3Gz),
  loadIndexFromGz(jigmoIndexGz),
] as const)

const fontMap: Partial<Record<string, opentype.Font>> = {
  'src/fonts/jigmo/Jigmo.ttf': jigmo,
  'src/fonts/jigmo/Jigmo2.ttf': jigmo2,
  'src/fonts/jigmo/Jigmo3.ttf': jigmo3,
}

export function renderJigumoFont(name: string) {
  const entry = index.get(name)
  if (!entry) {
    return null
  }

  const [fontPath, gid] = entry

  const font = fontMap[fontPath]
  if (!font) {
    return null
  }

  const fontSize = 1024
  const ascender = 880
  const baseline = 30
  const path = font.glyphs.get(gid).getPath(0, ascender + baseline, fontSize)
  const pathData = path.toPathData(2)

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="200" height="200">
  <path d="${pathData}" />
</svg>`

  return svg
}
