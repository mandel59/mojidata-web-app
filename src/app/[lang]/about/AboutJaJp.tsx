import ConditionalLink from '@/components/ConditionalLink'

export function AboutJaJp() {
  return (
    <>
      <h2>Mojidata Web Appについて</h2>
      <p>
        Mojidata Web
        Appは、オープンソース漢字情報データベースMojidataのウェブアプリケーションです。
      </p>
      <p>
        MojidataおよびMojidata Web
        Appのソースコードは、下記リポジトリから入手可能です。
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
        Mojidata Web
        Appを使うには、以下のオープンソースフォントがインストールされている必要があります。
      </p>
      <ul>
        <li>
          <ConditionalLink href="https://moji.or.jp/mojikiban/font/">
            IPAmjMincho Ver.006.01
          </ConditionalLink>{' '}
          文字情報基盤（Moji_Joho）のグリフを表示するのに必要です。
        </li>
        <li>
          <ConditionalLink href="https://github.com/adobe-fonts/source-han-serif/releases/tag/2.001R">
            Source Han Serif Version 2.001
          </ConditionalLink>{' '}
          地域字形やAdobe-Japan1字形を表示するのに必要です。
        </li>
      </ul>
      <hr />
      <p>
        Mojidata Web AppはGlyphWikiのグリフ画像を使っています。
        GlyphWikiは、ユーザーが漢字のグリフを作成、編集、共有できるオンラインプロジェクトです。
        GlyphWikiのデータのライセンス情報は、
        <ConditionalLink href="https://glyphwiki.org/wiki/GlyphWiki:%E3%83%87%E3%83%BC%E3%82%BF%E3%83%BB%E8%A8%98%E4%BA%8B%E3%81%AE%E3%83%A9%E3%82%A4%E3%82%BB%E3%83%B3%E3%82%B9">
          GlyphWiki:データ・記事のライセンス
        </ConditionalLink>
        ページで確認できます。
      </p>
      <hr />
      <p>
        Mojidataに含まれるデータおよび各漢字データベースのライセンスは出典ごとに異なります。
        詳細は下記ライセンス情報をご覧ください。
      </p>
    </>
  )
}
