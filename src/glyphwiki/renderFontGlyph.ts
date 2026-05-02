import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { gunzip } from 'node:zlib'
import { promisify } from 'node:util'
import opentype from 'opentype.js'

const doGunzip = promisify(gunzip)
const GLYPH_FONT_R2_KEY_PREFIX = 'glyph-fonts'
const parseOpenTypeFont = opentype.parse as (
  buffer: ArrayBuffer,
  options?: { lowMemory?: boolean },
) => opentype.Font

declare global {
  interface CloudflareEnv {
    GLYPH_FONT_ASSETS?: R2Bucket
  }
}

export interface GlyphFontSource {
  fontPath: string
  fontGzPath: string
}

export interface GlyphRenderBox {
  viewBoxSize?: number
  fontSize: number
  ascender: number
  baseline: number
}

export interface GlyphFontRendererConfig {
  indexGzPath: string
  fonts: GlyphFontSource[]
  renderBox: GlyphRenderBox | ((font: opentype.Font) => GlyphRenderBox)
}

type GlyphIndex = Map<string, [string, number]>
type GlyphFontRenderer = (name: string) => Promise<string | null>

interface FontCacheEntry {
  source: GlyphFontSource
  loaded?: Promise<{
    font: opentype.Font
    renderBox: GlyphRenderBox
  }>
}

function toR2Key(assetPath: string) {
  const normalized = assetPath.replaceAll('\\', '/')
  const fontPath = normalized.startsWith('src/fonts/')
    ? normalized.slice('src/fonts/'.length)
    : normalized
  return `${GLYPH_FONT_R2_KEY_PREFIX}/${fontPath}`
}

export async function getGlyphFontAssetsBucket() {
  // `next dev` exposes local Wrangler R2 bindings even when they are empty.
  // Prefer the bundled font files locally unless R2 testing is requested.
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.MOJIDATA_USE_GLYPH_R2_IN_DEV !== '1'
  ) {
    return undefined
  }

  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    return (await getCloudflareContext({ async: true })).env.GLYPH_FONT_ASSETS
  } catch {
    return undefined
  }
}

async function readGlyphFontAsset(assetPath: string) {
  const bucket = await getGlyphFontAssetsBucket()
  if (bucket) {
    const key = toR2Key(assetPath)
    const object = await bucket.get(key)
    if (!object) {
      throw new Error(`Glyph font asset not found in R2: ${key}`)
    }
    return new Uint8Array(await object.arrayBuffer())
  }

  return readFile(join(process.cwd(), assetPath))
}

export function renderGlyphPathDataAsSvg(
  pathData: string,
  renderBox: GlyphRenderBox,
) {
  const viewBoxSize = renderBox.viewBoxSize ?? 1024
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="200" height="200">
  <path d="${pathData}" />
</svg>`
}

async function loadFontFromGz(gzPath: string): Promise<opentype.Font> {
  const gzBuffer = await readGlyphFontAsset(gzPath)
  const ttfBuffer = await doGunzip(gzBuffer)
  return parseOpenTypeFont(
    ttfBuffer.buffer.slice(
      ttfBuffer.byteOffset,
      ttfBuffer.byteOffset + ttfBuffer.byteLength,
    ) as ArrayBuffer,
    { lowMemory: true },
  )
}

async function loadIndexFromGz(gzPath: string): Promise<GlyphIndex> {
  const gzBuffer = await readGlyphFontAsset(gzPath)
  const txtBuffer = await doGunzip(gzBuffer)
  const decoder = new TextDecoder()
  const index = new Map<string, [string, number]>()
  for (const line of decoder.decode(txtBuffer).split('\n').slice(1)) {
    if (!line) continue
    const [fontPath, name, gid] = line.split(',')
    index.set(name, [fontPath, Number.parseInt(gid, 10)])
  }
  return index
}

async function loadFontEntry(
  entry: FontCacheEntry,
  renderBox: GlyphFontRendererConfig['renderBox'],
) {
  if (!entry.loaded) {
    const loaded = loadFontFromGz(entry.source.fontGzPath)
      .then((font) => ({
        font,
        renderBox:
          typeof renderBox === 'function' ? renderBox(font) : renderBox,
      }))
      .catch((error) => {
        if (entry.loaded === loaded) entry.loaded = undefined
        throw error
      })
    entry.loaded = loaded
  }
  return entry.loaded
}

export async function createGlyphFontRenderer(
  config: GlyphFontRendererConfig,
): Promise<GlyphFontRenderer> {
  const index = await loadIndexFromGz(config.indexGzPath)
  const fontMap = new Map<string, FontCacheEntry>(
    config.fonts.map((source) => [source.fontPath, { source }]),
  )

  return async (name: string) => {
    const entry = index.get(name)
    if (!entry) {
      return null
    }

    const [fontPath, gid] = entry
    const fontEntry = fontMap.get(fontPath)
    if (!fontEntry) {
      return null
    }

    const { font, renderBox } = await loadFontEntry(fontEntry, config.renderBox)
    const path = font.glyphs
      .get(gid)
      .getPath(0, renderBox.ascender + renderBox.baseline, renderBox.fontSize)
    const pathData = path.toPathData(2)

    return renderGlyphPathDataAsSvg(pathData, renderBox)
  }
}
