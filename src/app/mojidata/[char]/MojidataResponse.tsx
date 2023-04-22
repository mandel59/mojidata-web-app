import { ReactElement, ReactNode } from 'react'
import { getApiUrl, getRevalidateDuration } from '@/app/config'
import {
  MojidataResults,
  getCharNameOfKdpvChar,
  getCodePointOfKdpvChar,
  getKdpvVariants,
  getMjsmVariants,
  getUnihanVariants,
  kdpvCharIsIDS,
  kdpvCharIsNonStandardVariant,
  toCodePoint,
} from './mojidata'
import './styles.css'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import GlyphWikiChar, { toGlyphWikiName } from '@/components/GlyphWikiChar'

const langTags = ['zh-CN', 'zh-TW', 'zh-HK', 'ja', 'ko'] as const

function compareString(x: string, y: string): number {
  if (x > y) {
    return 1
  }
  if (x < y) {
    return -1
  }
  return 0
}

function toCodePoints(s: string) {
  return [...s].map((c) => toCodePoint(c)).join(' ')
}

interface ConditionalLinkProps {
  href: string | undefined
  children: ReactNode | ReactNode[]
}

function ConditionalLink(props: ConditionalLinkProps): ReactElement {
  const { href, children } = props
  if (href) {
    return <Link href={href}>{children}</Link>
  } else {
    return <span>{children}</span>
  }
}

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

  const glyphWikiName = toGlyphWikiName(results.char)

  const kdpvVariants = getKdpvVariants(results)
  const unihanVariants = getUnihanVariants(results)
  const mjsmVariants = getMjsmVariants(results)

  const allVariantChars = Array.from(
    new Set([
      ...kdpvVariants.keys(),
      ...unihanVariants.keys(),
      ...mjsmVariants.keys(),
    ]),
  ).sort((x, y) => compareString(x, y))

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
      {false && (
        <section>
          <h3>Images</h3>
          <figure>
            <figcaption>
              <Link href={`https://glyphwiki.org/wiki/${glyphWikiName}`}>
                GlyphWiki {glyphWikiName}
              </Link>
            </figcaption>
            <div className="mojidata-char mojidata-char-glyphwiki">
              {/* @ts-expect-error Server Component */}
              <GlyphWikiChar name={glyphWikiName} alt={ucs} size={110} />
            </div>
          </figure>
        </section>
      )}
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
                <figcaption>
                  {record.code}
                  <br />
                  <small>{toCodePoints(record.char)}</small>
                </figcaption>
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
                  <br />
                  <small>{toCodePoints(record.char)}</small>
                </figcaption>
                <div className="mojidata-char mojidata-mojijoho">
                  {record.char}
                </div>
              </figure>
            ))}
          </div>
        </>
      )}
      {allVariantChars.length > 0 && (
        <>
          <h3>Variants</h3>
          {allVariantChars.map((char) => {
            const kdpvRelations = kdpvVariants.get(char)
            const unihanRelations = unihanVariants.get(char)
            const mjsmRelations = mjsmVariants.get(char)
            const isIDS = kdpvCharIsIDS(char)
            const isNonStandardVariant = kdpvCharIsNonStandardVariant(char)
            const charName = getCharNameOfKdpvChar(char)
            const codePoint = getCodePointOfKdpvChar(char)
            return (
              <figure key={char}>
                <figcaption>
                  <div>{charName}</div>
                  {unihanRelations && (
                    <div>
                      <small>unihan: {[...unihanRelations].join(', ')}</small>
                    </div>
                  )}
                  {kdpvRelations && (
                    <div>
                      <small>kdpv: {[...kdpvRelations].join(', ')}</small>
                    </div>
                  )}
                  {mjsmRelations && (
                    <div>
                      <small>mjsm: {[...mjsmRelations].join(', ')}</small>
                    </div>
                  )}
                </figcaption>
                <div
                  className={[
                    isIDS || isNonStandardVariant
                      ? 'mojidata-kdpv-char'
                      : 'mojidata-char',
                    isIDS || codePoint ? 'mojidata-char-link' : '',
                    codePoint ? 'mojidata-char-glyphwiki' : '',
                  ].join(' ')}
                >
                  <ConditionalLink
                    href={
                      codePoint
                        ? `/mojidata/${encodeURIComponent(codePoint)}`
                        : isIDS
                        ? `/idsfind?whole=${char}`
                        : undefined
                    }
                  >
                    {codePoint ? (
                      /* @ts-expect-error Server Component */
                      <GlyphWikiChar
                        name={toGlyphWikiName(char)}
                        alt={char}
                        size={110}
                      />
                    ) : (
                      char
                    )}
                  </ConditionalLink>
                </div>
              </figure>
            )
          })}
        </>
      )}
      <h3>External Links</h3>
      <ul>
        <li>
          <Link href={`https://www.chise.org/est/view/character/${char}`}>
            CHISE EsT character = {ucs}
          </Link>
        </li>
        <li>
          <Link
            href={`http://www.unicode.org/cgi-bin/GetUnihanData.pl?codepoint=${ucs
              .codePointAt(0)!
              .toString(16)
              .toUpperCase()}`}
          >
            Unihan data for {toCodePoint(ucs)}
          </Link>
        </li>
        <li>
          <Link
            href={`https://glyphwiki.org/wiki/u${ucs
              .codePointAt(0)!
              .toString(16)
              .toLowerCase()}`}
          >
            u{ucs.codePointAt(0)!.toString(16).toLowerCase()} ({ucs}) -
            GlyphWiki
          </Link>
        </li>
        {results.mji.map((record) => {
          function fromCodePoint(cp: string) {
            return String.fromCodePoint(parseInt(cp.slice(2), 16))
          }
          function fromCodePoints(cps: string) {
            return cps
              .split('_')
              .map((cp) => String.fromCodePoint(parseInt(cp, 16)))
              .join('')
          }
          const {
            MJ文字図形名,
            実装したUCS,
            実装したMoji_JohoコレクションIVS,
          } = record
          const href = `https://moji.or.jp/mojikibansearch/info?MJ%E6%96%87%E5%AD%97%E5%9B%B3%E5%BD%A2%E5%90%8D=${MJ文字図形名}`
          const char =
            (実装したUCS && fromCodePoint(実装したUCS)) ??
            (実装したMoji_JohoコレクションIVS &&
              fromCodePoints(実装したMoji_JohoコレクションIVS))
          return (
            <li key={MJ文字図形名}>
              <Link href={href}>
                文字情報基盤検索システム {MJ文字図形名} {char && ` (${char})`}
              </Link>
            </li>
          )
        })}
      </ul>
      <h3>JSON</h3>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  )
}
