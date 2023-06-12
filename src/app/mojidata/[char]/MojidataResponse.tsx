import { ReactElement, ReactNode } from 'react'
import { getApiUrl, getRevalidateDuration } from '@/app/config'
import {
  MojidataResults,
  getCharNameOfKdpvChar,
  getCns11643Search,
  getCodePointOfKdpvChar,
  getJoyoVariants,
  getKdpvVariants,
  getMjsmInverseVariants,
  getMjsmVariants,
  getNyukanInverseVariants,
  getNyukanVariants,
  getTghbVariants,
  getUnihanInverseVariants,
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

function fromMJCodePoint(cp: string) {
  return String.fromCodePoint(parseInt(cp.slice(2), 16))
}
function fromMJCodePoints(cps: string) {
  return cps
    .split('_')
    .map((cp) => String.fromCodePoint(parseInt(cp, 16)))
    .join('')
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
    // FIXME: Next.js bug? Navigation history is not recorded correctly when using Link.
    return <Link href={href}>{children}</Link>
  } else {
    return <span>{children}</span>
  }
}

async function fetchMojidata(char: string) {
  const url = new URL(getApiUrl('/api/v1/mojidata'))
  url.searchParams.set('char', char)
  // dummy query to avoid cache for older versions
  url.searchParams.set('_v', '1')
  const res = await fetch(url, {
    next: {
      revalidate: getRevalidateDuration(),
    },
    headers: {
      Accept: 'application/json',
    },
  })
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.statusText}, url: ${url.href}`)
  }
  const responseBody = await res.json()
  const { results }: { results: MojidataResults } = responseBody
  return results
}

interface MojidataResponseParams {
  ucs: string
}
export default async function MojidataResponse(
  params: MojidataResponseParams,
): Promise<ReactElement> {
  const { ucs } = params

  const results = await fetchMojidata(ucs)

  const cjkci = results.svs_cjkci.map((record) => record.CJKCI_char)
  const isCompatibilityCharacter = cjkci.length > 0 && cjkci[0] === ucs
  const compatibilityCharacters = !isCompatibilityCharacter
    ? await Promise.all(cjkci.map((char) => fetchMojidata(char)))
    : undefined

  const glyphWikiName = toGlyphWikiName(results.char)

  const kdpvVariants = getKdpvVariants(results)
  const unihanVariants = getUnihanVariants(results)
  const unihanInverseVariants = getUnihanInverseVariants(results)
  const joyoVariants = getJoyoVariants(results)
  const mjsmVariants = getMjsmVariants(results)
  const mjsmInverseVariants = getMjsmInverseVariants(results)
  const nyukanVariants = getNyukanVariants(results)
  const nyukanInverseVariants = getNyukanInverseVariants(results)
  const tghbVariants = getTghbVariants(results)

  const allVariantChars = Array.from(
    new Set([
      ...kdpvVariants.keys(),
      ...unihanVariants.keys(),
      ...unihanInverseVariants.keys(),
      ...joyoVariants.keys(),
      ...mjsmVariants.keys(),
      ...mjsmInverseVariants.keys(),
      ...nyukanVariants.keys(),
      ...nyukanInverseVariants.keys(),
      ...tghbVariants.keys(),
    ]),
  ).sort((x, y) => compareString(x, y))

  const unihanAj1 = results.unihan['kRSAdobe_Japan1_6']
  const unihanAj1DefaultCidMatch = unihanAj1?.match(/^C\+(\d+)/)
  const unihanAj1DefaultCid =
    unihanAj1DefaultCidMatch && `CID+${unihanAj1DefaultCidMatch[1]}`

  const unihanAj1CompatibilityCid = compatibilityCharacters
    ? compatibilityCharacters.map((results) => {
        const unihanAj1 = results.unihan['kRSAdobe_Japan1_6']
        const m = unihanAj1?.match(/^C\+(\d+)/) ?? undefined
        const cid = m && `CID+${m[1]}`
        return { ucs: results.UCS, cid }
      })
    : undefined

  const ivsAj1 = results.ivs.filter(
    (record) => record.collection === 'Adobe-Japan1',
  )

  const mji = results.mji
    .map((record) => {
      const {
        MJ文字図形名,
        実装したUCS,
        実装したSVS,
        実装したMoji_JohoコレクションIVS,
      } = record
      const href = `https://moji.or.jp/mojikibansearch/info?MJ%E6%96%87%E5%AD%97%E5%9B%B3%E5%BD%A2%E5%90%8D=${MJ文字図形名}`
      const ivs =
        実装したMoji_JohoコレクションIVS &&
        fromMJCodePoints(実装したMoji_JohoコレクションIVS)
      const ucs = 実装したUCS && fromMJCodePoint(実装したUCS)

      return {
        code: MJ文字図形名,
        char: ivs ?? ucs,
        ucs: ucs,
        compat: 実装したSVS ? true : false,
        href,
      }
    })
    .filter(
      (
        record,
      ): record is {
        code: string
        char: string
        ucs: string | null
        compat: boolean
        href: string
      } => record.char != null,
    )

  const cns11643Search = getCns11643Search(results)

  return (
    <div className="mojidata-response">
      <h2 id="Character_Data">Character Data</h2>
      <figure>
        <figcaption>
          {results.UCS} {results.char}
        </figcaption>
        <div className="mojidata-char mojidata-char-glyphwiki" lang="ja">
          <GlyphWikiChar name={glyphWikiName} alt={results.char} size={110} />
        </div>
      </figure>
      <h3 id="IDS">IDS</h3>
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
      <h3 id="Glyph_Comparison">Glyph Comparison</h3>
      <h4 id="Regional_Differences">Regional Differences</h4>
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
      <h4 id="Adobe-Japan1">Adobe-Japan1</h4>
      {ivsAj1.length > 0 && (
        <div className="mojidata-chars-comparison">
          {ivsAj1.map((record) => {
            const compat = unihanAj1CompatibilityCid?.find(
              ({ cid }) => record.code === cid,
            )
            return (
              <figure key={record.IVS}>
                <figcaption>
                  {record.code}
                  {record.code === unihanAj1DefaultCid && (
                    <span title="default glyph">*</span>
                  )}
                  {compat && (
                    <span title={`compatibility variant ${compat.ucs}`}>†</span>
                  )}
                  <br />
                  <small>{toCodePoints(record.char)}</small>
                </figcaption>
                <div className="mojidata-char" lang="ja">
                  {record.char}
                </div>
              </figure>
            )
          })}
        </div>
      )}
      <h4 id="Moji_Joho">Moji_Joho</h4>
      {mji.length > 0 && (
        <div className="mojidata-chars-comparison">
          {mji.map((record) => (
            <figure key={record.code}>
              <figcaption>
                <Link href={record.href}>{record.code}</Link>
                {record.ucs === ucs && !record.compat && (
                  <span title="default glyph">*</span>
                )}
                {record.compat && (
                  <span
                    title={`compatibility variant ${toCodePoint(record.ucs!)}`}
                  >
                    †
                  </span>
                )}
                <br />
                <small>{toCodePoints(record.char)}</small>
              </figcaption>
              <div className="mojidata-char mojidata-mojijoho" lang="ja">
                {record.char}
              </div>
            </figure>
          ))}
        </div>
      )}
      <h3 id="Variants">Variants</h3>
      {allVariantChars.length > 0 &&
        allVariantChars.map((char) => {
          const kdpvRelations = kdpvVariants.get(char)
          const kdpvForwardRelations = kdpvRelations
            ? [...kdpvRelations].filter((r) => !r.startsWith('~'))
            : []
          const kdpvBackwardRelations = kdpvRelations
            ? [...kdpvRelations].filter((r) => r.startsWith('~'))
            : []
          const unihanRelations = unihanVariants.get(char)
          const unihanInverseRelations = unihanInverseVariants.get(char)
          const joyoRelations = joyoVariants.get(char)
          const mjsmRelations = mjsmVariants.get(char)
          const mjsmInverseRelations = mjsmInverseVariants.get(char)
          const nyukanRelations = nyukanVariants.get(char)
          const nyukanInverseRelations = nyukanInverseVariants.get(char)
          const tghbRelations = tghbVariants.get(char)
          const isIDS = kdpvCharIsIDS(char)
          const isNonStandardVariant = kdpvCharIsNonStandardVariant(char)
          const charName = getCharNameOfKdpvChar(char)
          const codePoint = getCodePointOfKdpvChar(char)
          return (
            <figure key={char}>
              <figcaption>
                {charName === char ? (
                  <div>{charName}</div>
                ) : (
                  <div>
                    {charName} {char}
                  </div>
                )}
                {unihanRelations && (
                  <div>
                    <small>→unihan: {[...unihanRelations].join(', ')}</small>
                  </div>
                )}
                {unihanInverseRelations && (
                  <div>
                    <small>
                      ←unihan: {[...unihanInverseRelations].join(', ')}
                    </small>
                  </div>
                )}
                {joyoRelations && (
                  <div>
                    <small>→joyo: {[...joyoRelations].join(', ')}</small>
                  </div>
                )}
                {kdpvForwardRelations.length > 0 && (
                  <div>
                    <small>→kdpv: {kdpvForwardRelations.join(', ')}</small>
                  </div>
                )}
                {kdpvBackwardRelations.length > 0 && (
                  <div>
                    <small>
                      ←kdpv:{' '}
                      {kdpvBackwardRelations.map((r) => r.slice(1)).join(', ')}
                    </small>
                  </div>
                )}
                {mjsmRelations && (
                  <div>
                    <small>→mjsm: {[...mjsmRelations].join(', ')}</small>
                  </div>
                )}
                {mjsmInverseRelations && (
                  <div>
                    <small>←mjsm: {[...mjsmInverseRelations].join(', ')}</small>
                  </div>
                )}
                {nyukanRelations && (
                  <div>
                    <small>→nyukan: {[...nyukanRelations].join(', ')}</small>
                  </div>
                )}
                {nyukanInverseRelations && (
                  <div>
                    <small>
                      ←nyukan: {[...nyukanInverseRelations].join(', ')}
                    </small>
                  </div>
                )}
                {tghbRelations && (
                  <div>
                    <small>→tghb: {[...tghbRelations].join(', ')}</small>
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
      <h3 id="External_Links">External Links</h3>
      <ul>
        <li>
          <Link 
            href={`https://www.chise.org/est/view/character/${encodeURIComponent(
              ucs,
            )}`}
          >
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
          const {
            MJ文字図形名,
            実装したUCS,
            実装したMoji_JohoコレクションIVS,
          } = record
          const href = `https://moji.or.jp/mojikibansearch/info?MJ%E6%96%87%E5%AD%97%E5%9B%B3%E5%BD%A2%E5%90%8D=${MJ文字図形名}`
          const char =
            (実装したUCS && fromMJCodePoint(実装したUCS)) ??
            (実装したMoji_JohoコレクションIVS &&
              fromMJCodePoints(実装したMoji_JohoコレクションIVS))
          return (
            <li key={MJ文字図形名}>
              <Link href={href}>
                文字情報基盤検索システム {MJ文字図形名}{' '}
                <span className="mojidata-mojijoho">
                  {char && ` (${char})`}
                </span>
              </Link>
            </li>
          )
        })}
        {cns11643Search && (
          <li>
            <Link href={cns11643Search.href}>{cns11643Search.title}</Link>
          </li>
        )}
      </ul>
      <h3 id="JSON">JSON</h3>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  )
}
