import { getRevalidateDuration } from '@/app/config'
import { customFetch } from '@/customFetch'

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
    const svgImageResponse = await customFetch(
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
      }
    }
    const svgImage = await svgImageResponse.text()
    return {
      name,
      svgImage,
    }
  } catch (error) {
    console.error(error)
    return {
      name,
      svgImage: null,
    }
  }
}
