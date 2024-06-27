import localFont from 'next/font/local'

export const fontCjkSymbols = localFont({
  src: '../fonts/CJKSymbols-Regular.woff2',
  display: 'swap',
  variable: '--font-cjksymbols',
  adjustFontFallback: false,
  declarations: [
    {
      // exclude U+3000 IDEOGRAPHIC SPACE
      prop: 'unicode-range',
      value: 'U+0-2FFF, U+3001-10FFFF',
    },
  ],
})

export const fontNotDef = localFont({
  src: '../fonts/AND-Regular.woff2',
  display: 'swap',
  variable: '--font-notdef',
  adjustFontFallback: false,
})
