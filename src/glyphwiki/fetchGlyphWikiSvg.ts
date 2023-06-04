import { getRevalidateDuration } from '@/app/config'

export function toGlyphWikiName(s: string) {
  return [...s]
    .map(
      (c) =>
        'u' + c.codePointAt(0)?.toString(16).toLowerCase().padStart(4, '0'),
    )
    .join('-')
}

export async function fetchGlyphWikiSvg(name: string) {
  try {
    const svgImageResponse = await fetch(
      `https://glyphwiki.org/glyph/${encodeURIComponent(name)}.svg`,
      {
        next: {
          revalidate: getRevalidateDuration(),
        },
      },
    )
    if (!svgImageResponse.ok) {
      // Failed to fetch SVG image.
      return {
        name,
        svgImage: null,
        svgImageDataUri: null,
      }
    }
    const svgImage = await svgImageResponse.text()
    const svgImageDataUri = `data:image/svg+xml,${encodeURIComponent(svgImage)}`
    return {
      name,
      svgImage,
      svgImageDataUri,
    }
  } catch (error) {
    console.error(error)
    return {
      name,
      svgImage: null,
      svgImageDataUri: null,
    }
  }
}
