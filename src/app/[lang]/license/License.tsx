import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import mojidataWebAppLicenseMd from '@/../LICENSE.md'
import mojidataLicenseMd from '@mandel59/mojidata/LICENSE.md'
import notices from '@/licensing/notices.generated.json'
import styles from './License.module.css'

const licenseNotices: { title: string; files: { name: string; text: string }[] }[] = notices

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
      <hr />
      {licenseNotices.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {section.files.map((file) => (
            <details key={file.name} className={styles.notice}>
              <summary>{file.name}</summary>
              <pre className={styles.text}>{file.text}</pre>
            </details>
          ))}
        </section>
      ))}
    </>
  )
}

