import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import mojidataWebAppLicenseMd from '@/../LICENSE.md'
import mojidataLicenseMd from '@mandel59/mojidata/LICENSE.md'
import ConditionalLink from '@/components/ConditionalLink'

export const runtime = 'experimental-edge'

export default function License() {
  const mojidataWebAppBaseUrl =
    'https://github.com/mandel59/mojidata-web-app/blob/main'
  const mojidataBaseUrl =
    'https://github.com/mandel59/mojidata/blob/main/packages/mojidata'
  const customUriTransformer = (baseUrl: string) => (uri: string) => {
    uri = defaultUrlTransform(uri)
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
            <ConditionalLink href="https://github.com/mandel59/mojidata">
              GitHub mandel59/mojidata
            </ConditionalLink>
          </li>
          <li>
            <ConditionalLink href="https://github.com/mandel59/mojidata-api">
              GitHub mandel59/mojidata-api
            </ConditionalLink>
          </li>
          <li>
            <ConditionalLink href="https://github.com/mandel59/mojidata-web-app">
              GitHub mandel59/mojidata-web-app
            </ConditionalLink>
          </li>
        </ul>
        <hr />
        <p>
          The Mojidata Web App requires the following open-source fonts
          installed:
        </p>
        <ul>
          <li>
            <ConditionalLink href="https://moji.or.jp/mojikiban/font/">
              IPAmjMincho Ver.006.01
            </ConditionalLink>{' '}
            is required for Moji_Joho glyphs
          </li>
          <li>
            <ConditionalLink href="https://github.com/adobe-fonts/source-han-serif/releases/tag/2.001R">
              Source Han Serif Version 2.001
            </ConditionalLink>{' '}
            is required for regional glyphs and Adobe-Japan1 glyphs
          </li>
        </ul>
        <hr />
        <p>
          The Mojidata Web App uses glyph images from GlyphWiki. GlyphWiki is an
          online project that allows users to create, edit, and share glyphs of
          Chinese characters. You can view the license information for
          GlyphWiki&apos;s data on the{' '}
          <ConditionalLink href="http://en.glyphwiki.org/wiki/GlyphWiki:License">
            GlyphWiki:License
          </ConditionalLink>{' '}
          page.
        </p>
        <hr />
        <ReactMarkdown
          urlTransform={customUriTransformer(mojidataWebAppBaseUrl)}
        >
          {mojidataWebAppLicenseMd}
        </ReactMarkdown>
        <hr />
        <ReactMarkdown urlTransform={customUriTransformer(mojidataBaseUrl)}>
          {
            /* Replace <br> tag to Markdown line break */
            mojidataLicenseMd.replace(/<br\s*\/?>\n?/g, '  \n')
          }
        </ReactMarkdown>
      </article>
    </main>
  )
}
