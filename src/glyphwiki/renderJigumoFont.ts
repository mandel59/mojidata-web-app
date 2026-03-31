import { createGlyphFontRenderer } from '@/glyphwiki/renderFontGlyph'

export const renderJigumoFont = await createGlyphFontRenderer({
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
})
