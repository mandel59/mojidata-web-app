import ReactMarkdown, { uriTransformer } from 'react-markdown'
import mojidataLicenseMd from '@mandel59/mojidata/LICENSE.md'
import Link from 'next/link'

export const runtime = 'experimental-edge'

export default function License() {
  const baseUrl =
    'https://github.com/mandel59/mojidata/blob/main/packages/mojidata'
  function customUriTransformer(uri: string) {
    if (/^\w+?:\/\//.test(uri)) {
      return uri
    }
    if (uri.startsWith('/')) {
      return `${baseUrl}${uri}`
    }
    return `${baseUrl}/${uri}`
  }
  return (
    <main className="container">
      <article>
        <h2>About Mojidata</h2>
        <p>
          The Mojidata Web App is a web application for Mojidata, an open-source
          collection of kanji information databases. The license for each kanji
          database varies depending on the source.
        </p>
        <ul>
          <li>
            <Link href="https://github.com/mandel59/mojidata">
              GitHub mandel59/mojidata
            </Link>
          </li>
          <li>
            <Link href="https://github.com/mandel59/mojidata-api">
              GitHub mandel59/mojidata-api
            </Link>
          </li>
          <li>
            <Link href="https://github.com/mandel59/mojidata-web-app">
              GitHub mandel59/mojidata-web-app
            </Link>
          </li>
        </ul>
        <hr />
        <p>
          The Mojidata Web App requires the following open-source fonts
          installed:
        </p>
        <ul>
          <li>
            <a href="https://moji.or.jp/mojikiban/font/">
              IPAmjMincho Ver.006.01
            </a>{' '}
            is required for Moji_Joho glyphs
          </li>
          <li>
            <a href="https://github.com/adobe-fonts/source-han-serif/releases/tag/2.001R">
              Source Han Serif Version 2.001
            </a>{' '}
            is required for regional glyphs and Adobe-Japan1 glyphs
          </li>
        </ul>
        <hr />
        <p>
          The Mojidata Web App uses glyph images from GlyphWiki. GlyphWiki is an
          online project that allows users to create, edit, and share glyphs of
          Chinese characters. You can view the license information for
          GlyphWiki&apos;s data on the{' '}
          <Link href="http://en.glyphwiki.org/wiki/GlyphWiki:License">
            GlyphWiki:License
          </Link>{' '}
          page.
        </p>
        <hr />
        <ReactMarkdown urlTransform={customUriTransformer}>
          {
            /* Replace <br> tag to Markdown line break */
            mojidataLicenseMd.replace(/<br\s*\/?>\n?/g, '  \n')
          }
        </ReactMarkdown>
      </article>
    </main>
  )
}
