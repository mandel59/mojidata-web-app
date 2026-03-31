import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { gunzip } from 'node:zlib'
import { promisify } from 'node:util'
import opentype from 'opentype.js'

const doGunzip = promisify(gunzip)

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

async function loadFontFromGz(gzPath: string): Promise<opentype.Font> {
  const gzBuffer = await readFile(join(process.cwd(), gzPath))
  const ttfBuffer = await doGunzip(gzBuffer)
  return opentype.parse(
    ttfBuffer.buffer.slice(
      ttfBuffer.byteOffset,
      ttfBuffer.byteOffset + ttfBuffer.byteLength,
    ),
  )
}

async function loadIndexFromGz(gzPath: string): Promise<GlyphIndex> {
  const gzBuffer = await readFile(join(process.cwd(), gzPath))
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

export function createWinMetricsRenderBox(
  font: opentype.Font,
  options: { viewBoxSize?: number; padding?: number } = {},
): GlyphRenderBox {
  const viewBoxSize = options.viewBoxSize ?? 1024
  const padding = options.padding ?? 0
  const innerSize = viewBoxSize - 2 * padding
  const { os2 } = font.tables
  const ascent = os2?.usWinAscent ?? font.tables.head.yMax
  const descent = os2?.usWinDescent ?? Math.max(0, -font.tables.head.yMin)
  const scale = innerSize / (ascent + descent)
  return {
    viewBoxSize,
    fontSize: font.unitsPerEm * scale,
    ascender: padding + ascent * scale,
    baseline: 0,
  }
}

export async function createGlyphFontRenderer(config: GlyphFontRendererConfig) {
  const [loadedFonts, index] = await Promise.all([
    Promise.all(
      config.fonts.map(async (source) => ({
        source,
        font: await loadFontFromGz(source.fontGzPath),
      })),
    ),
    loadIndexFromGz(config.indexGzPath),
  ])

  const fontMap = new Map(
    loadedFonts.map(({ source, font }) => [
      source.fontPath,
      {
        font,
        renderBox:
          typeof config.renderBox === 'function'
            ? config.renderBox(font)
            : config.renderBox,
      },
    ]),
  )

  return (name: string) => {
    const entry = index.get(name)
    if (!entry) {
      return null
    }

    const [fontPath, gid] = entry
    const fontEntry = fontMap.get(fontPath)
    if (!fontEntry) {
      return null
    }

    const { font, renderBox } = fontEntry
    const viewBoxSize = renderBox.viewBoxSize ?? 1024
    const path = font.glyphs
      .get(gid)
      .getPath(0, renderBox.ascender + renderBox.baseline, renderBox.fontSize)
    const pathData = path.toPathData(2)

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="200" height="200">
  <path d="${pathData}" />
</svg>`
  }
}
