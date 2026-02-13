export function toGlyphWikiName(s: string) {
  if (s[0] === '&' && s[s.length - 1] === ';') {
    return s
      .slice(1, s.length - 1)
      .toLowerCase()
      .replace(/^uk-/, 'utc-')
  }
  return [...s]
    .map(
      (c) =>
        'u' + c.codePointAt(0)?.toString(16).toLowerCase().padStart(4, '0'),
    )
    .join('-')
}

