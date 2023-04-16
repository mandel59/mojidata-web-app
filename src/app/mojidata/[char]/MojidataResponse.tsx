import { ReactElement } from 'react'
import { getApiUrl, getRevalidateDuration } from '@/app/config'
import { MojidataResults } from './mojidata'
import './styles.css'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const langTags = ['zh-CN', 'zh-TW', 'zh-HK', 'ja', 'ko'] as const

interface MojidataResponseParams {
  char: string
}
export default async function MojidataResponse(
  params: MojidataResponseParams,
): Promise<ReactElement> {
  const { char } = params

  const ucs = decodeURIComponent(char)

  if ((ucs.codePointAt(0) ?? 0) <= 0x7f) {
    notFound()
  }

  if ([...ucs].length !== 1) {
    notFound()
  }

  const url = new URL(getApiUrl('/api/v1/mojidata'))
  url.searchParams.set('char', ucs)
  const res = await fetch(url, {
    next: {
      revalidate: getRevalidateDuration(),
    },
  })
  if (!res.ok) {
    const responseBody = await res.json()
    throw new Error(
      responseBody?.error?.message ?? responseBody?.error ?? responseBody,
    )
  }
  const responseBody = await res.json()
  const { results }: { results: MojidataResults } = responseBody

  const ivsAj1 = results.ivs.filter(
    (record) => record.collection === 'Adobe-Japan1',
  )
  const ivsMj = results.ivs.filter(
    (record) => record.collection === 'Moji_Joho',
  )

  return (
    <div className="mojidata-response">
      <h2>Character Data</h2>
      <figure>
        <figcaption>{results.UCS}</figcaption>
        <div className="mojidata-char">{results.char}</div>
      </figure>
      <h3>IDS</h3>
      <table>
        <thead>
          <tr>
            <th>IDS</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {results.ids.map((record) => (
            <tr key={record.source}>
              <td>{record.IDS}</td>
              <td>{record.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Glyph Comparison</h3>
      <h4>By Languages and Regions Using System Fonts</h4>
      <div className="mojidata-chars-comparison">
        {langTags.map((lang) => (
          <figure key={lang}>
            <figcaption>{lang}</figcaption>
            <div className="mojidata-char" lang={lang}>
              {results.char}
            </div>
          </figure>
        ))}
      </div>
      {ivsAj1.length > 0 && (
        <>
          <h4>Adobe-Japan1</h4>
          <div className="mojidata-chars-comparison">
            {ivsAj1.map((record) => (
              <figure key={record.IVS}>
                <figcaption>{record.code}</figcaption>
                <div className="mojidata-char">{record.char}</div>
              </figure>
            ))}
          </div>
        </>
      )}
      {ivsMj.length > 0 && (
        <>
          <h4>Moji_Joho</h4>
          <div className="mojidata-chars-comparison">
            {ivsMj.map((record) => (
              <figure key={record.IVS}>
                <figcaption>
                  <Link
                    href={`https://moji.or.jp/mojikibansearch/info?MJ%E6%96%87%E5%AD%97%E5%9B%B3%E5%BD%A2%E5%90%8D=${record.code}`}
                  >
                    {record.code}
                  </Link>
                </figcaption>
                <div className="mojidata-char mojidata-mojijoho">
                  {record.char}
                </div>
              </figure>
            ))}
          </div>
        </>
      )}
      <h3>External Links</h3>
      <ul>
        <li>
          <Link href={`https://www.chise.org/est/view/character/${char}`}>
            CHISE EsT character
          </Link>
        </li>
        <li>
          <Link
            href={`http://www.unicode.org/cgi-bin/GetUnihanData.pl?codepoint=${ucs
              .codePointAt(0)!
              .toString(16)
              .toUpperCase()}`}
          >
            Unihan
          </Link>
        </li>
        <li>
          <Link
            href={`https://glyphwiki.org/wiki/u${ucs
              .codePointAt(0)!
              .toString(16)
              .toLowerCase()}`}
          >
            GlyphWiki
          </Link>
        </li>
      </ul>
      <h3>JSON</h3>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  )
}
