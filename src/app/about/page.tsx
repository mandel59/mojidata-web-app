import ReactMarkdown, { uriTransformer } from 'react-markdown'
import mojidataLicenseMd from '@mandel59/mojidata/LICENSE.md'
import Link from 'next/link'

export default function License() {
  const baseUrl =
    'https://github.com/mandel59/mojidata/blob/main/packages/mojidata'
  function customUriTransformer(uri: string) {
    const uri1 = uriTransformer(uri)
    if (/^\w+?:\/\//.test(uri1)) {
      return uri1
    }
    if (uri1.startsWith('/')) {
      return `${baseUrl}${uri1}`
    }
    return `${baseUrl}/${uri1}`
  }
  return (
    <main>
      <h2>About Mojidata</h2>
      <p>
        Mojidata is an open-source collection of kanji information databases.
        The license for each kanji database varies depending on the source.
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
      <ReactMarkdown transformLinkUri={customUriTransformer}>
        {mojidataLicenseMd}
      </ReactMarkdown>
    </main>
  )
}
