import {
  createGlyphFontRenderer,
  createWinMetricsRenderBox,
} from '@/glyphwiki/renderFontGlyph'

export const renderIpamjmFont = await createGlyphFontRenderer({
  indexGzPath: 'src/fonts/ipamjm/glyph-index.txt.gz',
  fonts: [
    {
      fontPath: 'src/fonts/ipamjm/ipamjm.ttf',
      fontGzPath: 'src/fonts/ipamjm/ipamjm.ttf.gz',
    },
  ],
  renderBox: (font) => createWinMetricsRenderBox(font),
})
