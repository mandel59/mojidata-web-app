import ConditionalLink from '@/components/ConditionalLink'

export function AboutEnUs() {
  return (
    <>
      <h2>About Mojidata Web App</h2>
      <p>
        The Mojidata Web App is a web application for Mojidata, an open-source
        collection of kanji information databases.
      </p>
      <p>
        The source code for Mojidata and the Mojidata Web App is available from
        the following repositories.
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
        The Mojidata Web App requires the following open-source fonts installed:
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
      <p>
        The license for data and each kanji database included in Mojidata varies
        depending on their sources. Please refer to the following license
        information for details.
      </p>
    </>
  )
}
