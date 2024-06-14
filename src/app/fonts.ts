import localFont from 'next/font/local'

export const fontCjkSymbols = localFont({
  src: '../fonts/CJKSymbols-Regular.woff2',
  display: 'swap',
  variable: '--font-cjksymbols',
  adjustFontFallback: false,
})
