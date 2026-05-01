import { createGlyphFontRenderer } from '@/glyphwiki/renderFontGlyph'
import { createGlyphPathShardRenderer } from '@/glyphwiki/renderGlyphPathShard'

const rendererConfig = {
  indexGzPath: 'src/fonts/jigmo/glyph-index.txt.gz',
  fonts: [
    {
      fontPath: 'src/fonts/jigmo/Jigmo.ttf',
      fontGzPath: 'src/fonts/jigmo/Jigmo.ttf.gz',
    },
    {
      fontPath: 'src/fonts/jigmo/Jigmo2.ttf',
      fontGzPath: 'src/fonts/jigmo/Jigmo2.ttf.gz',
    },
    {
      fontPath: 'src/fonts/jigmo/Jigmo3.ttf',
      fontGzPath: 'src/fonts/jigmo/Jigmo3.ttf.gz',
    },
  ],
  renderBox: {
    viewBoxSize: 1024,
    fontSize: 1024,
    ascender: 880,
    baseline: 30,
  },
}

let fallbackRendererPromise:
  | ReturnType<typeof createGlyphFontRenderer>
  | undefined

async function renderFromLocalFont(name: string) {
  if (!fallbackRendererPromise) {
    const current = createGlyphFontRenderer(rendererConfig).catch((error) => {
      if (fallbackRendererPromise === current) fallbackRendererPromise = undefined
      throw error
    })
    fallbackRendererPromise = current
  }
  return (await fallbackRendererPromise)(name)
}

const renderFromShard = createGlyphPathShardRenderer({
  source: 'jigmo',
  renderBox: rendererConfig.renderBox,
  fallback: renderFromLocalFont,
})

export async function renderJigumoFont(name: string) {
  return renderFromShard(name)
}
