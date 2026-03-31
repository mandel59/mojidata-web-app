const vsPattern = /[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/gu

export function normalizeSearchChar(s: string) {
  return s.normalize('NFC').replace(vsPattern, '')
}

export function stripLocalePrefix(pathname: string) {
  return pathname.replace(/^\/[a-z]{2}-[A-Z]{2}(?=\/)/, '')
}

export function buildPageHref(baseUrl: URL, page: number) {
  const url = new URL(baseUrl)
  if (page > 1) {
    url.searchParams.set('page', String(page))
  } else {
    url.searchParams.delete('page')
  }
  return url.pathname + url.search
}
