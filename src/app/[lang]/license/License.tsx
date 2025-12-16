import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import mojidataWebAppLicenseMd from '@/../LICENSE.md'
import mojidataLicenseMd from '@mandel59/mojidata/LICENSE.md'

export function Licence() {
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
    <>
      <ReactMarkdown urlTransform={customUriTransformer(mojidataWebAppBaseUrl)}>
        {mojidataWebAppLicenseMd}
      </ReactMarkdown>
      <hr />
      <ReactMarkdown urlTransform={customUriTransformer(mojidataBaseUrl)}>
        {
          /* Replace <br> tag to Markdown line break */
          mojidataLicenseMd.replace(/<br\s*\/?>\n?/g, '  \n')
        }
      </ReactMarkdown>
    </>
  )
}

