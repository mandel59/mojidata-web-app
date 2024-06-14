export function insertWhiteLayerToGlyphWikiSvg(svgImage: string) {
  return svgImage.replace(
    /<svg [^>]*viewBox="(-?\d+) (-?\d+) (\d+) (\d+)"[^>]*>/,
    `$&<rect x="$1" y="$2" width="$3" height="$4" fill="#fff"/>`,
  )
}
