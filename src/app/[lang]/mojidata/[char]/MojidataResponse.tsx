import { ReactElement, ReactNode } from 'react'
import {
  fetchMojidata,
  getBabelStoneIdsInverseVariants,
  getBabelStoneIdsVariants,
  getCharNameOfKdpvChar,
  getCns11643Search,
  getCodePointOfKdpvChar,
  getHentaigana,
  getIvsDuplicates,
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
import GlyphWikiChar, { toGlyphWikiName } from '@/components/GlyphWikiChar'
import { Language, getText } from '@/getText'

const langTags = ['zh-CN', 'zh-TW', 'zh-HK', 'ja-JP', 'ko-KR'] as const
const irgKeys = {
  'zh-CN': 'kIRG_GSource',
  'zh-TW': 'kIRG_TSource',
  'zh-HK': 'kIRG_HSource',
  'ja-JP': 'kIRG_JSource',
  'ko-KR': 'kIRG_KSource',
} as const

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

interface MojidataResponseParams {
  ucs: string
  bot: boolean
  disableExternalLinks: boolean
  lang: Language
}
export default async function MojidataResponse(
  params: MojidataResponseParams,
): Promise<ReactElement> {
  const { ucs, bot, disableExternalLinks, lang } = params

  const results = await fetchMojidata(ucs)

  const charIsHan =
    /[\p{Script=Han}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}]/u.test(results.char)

  const charIsHentaigana = results.mjih[0]?.文字 === results.char
  const 学術用変体仮名番号 = charIsHentaigana
    ? results.mjih[0]?.学術用変体仮名番号 ?? undefined
    : undefined

  const cjkci = results.svs_cjkci.map((record) => record.CJKCI_char)
  const isCompatibilityCharacter =
    results.svs_cjkci.length > 0 && cjkci[0] === ucs
  const canonicalCharacter = isCompatibilityCharacter
    ? await fetchMojidata([...results.svs_cjkci[0].SVS_char][0])
    : results
  const compatibilityCharacters = !isCompatibilityCharacter
    ? await Promise.all(cjkci.map((char) => fetchMojidata(char)))
    : undefined

  const svs = results.svs_cjkci.find(
    (record) => record.CJKCI_char === results.char,
  )

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
  const babelStoneIdsVariants = getBabelStoneIdsVariants(results)
  const idsInverseVariants = getBabelStoneIdsInverseVariants(results)
  const hentaigana = getHentaigana(results)
  const ivsDuplicates = getIvsDuplicates(results)

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
      ...babelStoneIdsVariants.keys(),
      ...idsInverseVariants.keys(),
      ...hentaigana.keys(),
      ...ivsDuplicates.keys(),
    ]),
  ).sort((x, y) => compareString(x, y))

  const aj1Cid =
    results.aj1?.CID != null ? `CID+${results.aj1?.CID}` : undefined
  const aj1Jp90 =
    results.aj1?.jp90 != null ? `CID+${results.aj1?.jp90}` : undefined
  const aj1Jp04 =
    results.aj1?.jp04 != null ? `CID+${results.aj1?.jp04}` : undefined

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
        X0213_包摂区分,
        X0212,
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
        x0213: X0213_包摂区分 === 0,
        x0212: X0212 != null,
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
        x0213: boolean
        x0212: boolean
        href: string
      } => record.char != null,
    )

  const isJISX0213char = mji.some((record) => record.x0213)

  const cns11643Search = getCns11643Search(results)

  return (
    <article>
      <div className="mojidata-response">
        <h2 id="Character_Data">{getText('character-data.h2', lang)}</h2>
        <figure>
          <figcaption>
            {results.UCS} {results.char}
            {svs && (
              <>
                <br />
                <small>
                  {toCodePoints(svs.SVS_char)} {svs.SVS_char}
                </small>
              </>
            )}
          </figcaption>
          <div className="mojidata-char mojidata-char-glyphwiki" lang="ja">
            <GlyphWikiChar
              name={glyphWikiName}
              alt={results.char}
              size={110}
              bot={bot}
            />
          </div>
        </figure>
        {!isCompatibilityCharacter && results.svs_cjkci.length > 0 && (
          <>
            <h3 id="Compatibility_Ideographs">
              {getText('compatibility-ideographs.h3', lang)}
            </h3>
            <div className="mojidata-chars-comparison">
              {results.svs_cjkci.map((record) => {
                return (
                  <figure key={record.SVS}>
                    <figcaption>
                      {record.CJKCI} {record.CJKCI_char}
                      <br />
                      <small>{toCodePoints(record.SVS_char)} {record.SVS_char}</small>
                    </figcaption>
                    <div
                      className="mojidata-char mojidata-char-link mojidata-char-glyphwiki"
                      lang="ja"
                    >
                      <Link href={`/mojidata/${record.CJKCI_char}`}>
                        <GlyphWikiChar
                          name={toGlyphWikiName(record.CJKCI_char)}
                          alt={record.CJKCI}
                          size={110}
                          bot={bot}
                        />
                      </Link>
                    </div>
                  </figure>
                )
              })}
            </div>
          </>
        )}
        <h3 id="IDS">{getText('ids.h3', lang)}</h3>
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
        <h3 id="Glyph_Comparison">{getText('glyph-comparison.h3', lang)}</h3>
        <h4 id="Regional_Differences">
          {getText('regional-differences.h4', lang)}
        </h4>
        <div className="mojidata-chars-comparison">
          {langTags.map((lang) => (
            <figure key={lang}>
              <figcaption>
                {lang}
                <br />
                <small>{results.unihan[irgKeys[lang]] ?? 'N/A'}</small>
              </figcaption>
              <div className="mojidata-char">
                <span
                  lang={lang}
                  className="mojidata-raw-char mojidata-source-han-serif"
                >
                  {results.char}
                </span>
              </div>
            </figure>
          ))}
        </div>
        <h4 id="Adobe-Japan1">{getText('adobe-japan1.h4', lang)}</h4>
        {ivsAj1.length > 0 && (
          <div className="mojidata-chars-comparison">
            {ivsAj1.map((record) => {
              const compat = unihanAj1CompatibilityCid?.find(
                ({ cid }) => record.code === cid,
              )
              return (
                <figure key={record.code}>
                  <figcaption>
                    {record.code}
                    {record.code === aj1Jp04 && (
                      <small
                        title={
                          record.code !== aj1Jp90
                            ? getText('jp04-glyph.title', lang)
                            : getText('default-glyph.title', lang)
                        }
                      >
                        {' '}
                        {record.code !== aj1Jp90
                          ? getText('jp04-glyph.small', lang)
                          : getText('default-glyph.small', lang)}
                      </small>
                    )}
                    {record.code === aj1Jp90 && record.code !== aj1Jp04 && (
                      <small title={getText('jp90-glyph.title', lang)}>
                        {' '}
                        {getText('jp90-glyph.small', lang)}
                      </small>
                    )}
                    {compat && (
                      <small
                        title={`${getText(
                          'compatibility-variant.title',
                          lang,
                        )} ${compat.ucs}`}
                      >
                        {' '}
                        {getText('compatibility-variant.small', lang)}
                      </small>
                    )}
                    <br />
                    <small>{toCodePoints(record.char)}</small>
                  </figcaption>
                  <div className="mojidata-char">
                    <span
                      lang="ja"
                      className="mojidata-raw-char mojidata-source-han-serif"
                    >
                      {record.char}
                    </span>
                  </div>
                </figure>
              )
            })}
          </div>
        )}
        {isCompatibilityCharacter && ivsAj1.length === 0 && aj1Cid && (
          <div className="mojidata-chars-comparison">
            <figure key={aj1Cid}>
              <figcaption>
                {aj1Cid}
                <small
                  title={`${getText('compatibility-variant.title', lang)} ${
                    results.UCS
                  }`}
                >
                  {' '}
                  {getText('compatibility-variant.small', lang)}
                </small>
                <br />
                <small>{results.UCS}</small>
              </figcaption>
              <div className="mojidata-char" lang="ja">
                <span className="mojidata-raw-char mojidata-source-han-serif">
                  {results.char}
                </span>
              </div>
            </figure>
          </div>
        )}
        <h4 id="Moji_Joho">{getText('moji-joho.h4', lang)}</h4>
        {mji.length > 0 && (
          <div className="mojidata-chars-comparison">
            {mji.map((record) => (
              <figure key={record.code}>
                <figcaption>
                  <a href={record.href}>{record.code}</a>
                  {record.ucs === ucs && !record.compat && (
                    <small title={getText('default-glyph.title', lang)}>
                      {' '}
                      {getText('default-glyph.small', lang)}
                    </small>
                  )}
                  {isJISX0213char &&
                    !record.x0213 &&
                    record.ucs === ucs &&
                    !record.compat && (
                      <small title={getText('not-jp04-glyph.title', lang)}>
                        {' '}
                        {getText('not-jp04-glyph.small', lang)}
                      </small>
                    )}
                  {record.x0213 && !record.compat && (
                    <small title={getText('jp04-glyph.title', lang)}>
                      {' '}
                      {getText('jp04-glyph.small', lang)}
                    </small>
                  )}
                  {!(record.ucs === ucs) && !record.compat && record.x0212 && (
                    <small title={getText('hojo-glyph.title', lang)}>
                      {' '}
                      {getText('hojo-glyph.small', lang)}
                    </small>
                  )}
                  {record.compat && (
                    <small
                      title={`${getText(
                        'compatibility-variant.title',
                        lang,
                      )} ${toCodePoint(record.ucs!)}`}
                    >
                      {' '}
                      {getText('compatibility-variant.small', lang)}
                    </small>
                  )}
                  <br />
                  <small>{toCodePoints(record.char)}</small>
                </figcaption>
                <div className="mojidata-char" lang="ja">
                  <span className="mojidata-raw-char mojidata-mojijoho">
                    {record.char}
                  </span>
                </div>
              </figure>
            ))}
          </div>
        )}
        <h3 id="Variants">
          {getText('variants-and-relevant-characters.h3', lang)}
        </h3>
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
            const babelStoneIdsRelations = babelStoneIdsVariants.get(char)
            const idsInverseRelations = idsInverseVariants.get(char)
            const isIDS = kdpvCharIsIDS(char)
            const isNonStandardVariant = kdpvCharIsNonStandardVariant(char)
            const charName = getCharNameOfKdpvChar(char)
            const codePoint = getCodePointOfKdpvChar(char)
            const hentaiganaRelations = hentaigana.get(char)
            const ivsDuplicateRelations = ivsDuplicates.get(char)
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
                        {kdpvBackwardRelations
                          .map((r) => r.slice(1))
                          .join(', ')}
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
                      <small>
                        ←mjsm: {[...mjsmInverseRelations].join(', ')}
                      </small>
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
                  {babelStoneIdsRelations && (
                    <div>
                      <small>
                        →ids: {[...babelStoneIdsRelations].join(', ')}
                      </small>
                    </div>
                  )}
                  {idsInverseRelations && (
                    <div>
                      <small>←ids: {[...idsInverseRelations].join(', ')}</small>
                    </div>
                  )}
                  {hentaiganaRelations && (
                    <div>
                      <small>
                        →mjih: {[...hentaiganaRelations].join(', ')}
                      </small>
                    </div>
                  )}
                  {ivsDuplicateRelations && (
                    <div>
                      <small>
                        →ivs: {[...ivsDuplicateRelations].join(', ')}
                      </small>
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
                        bot={bot}
                      />
                    ) : (
                      char
                    )}
                  </ConditionalLink>
                </div>
              </figure>
            )
          })}
        {!disableExternalLinks && (
          <>
            <h3 id="External_Links">{getText('external-links.h3', lang)}</h3>
            <ul>
              <li>
                <a
                  href={`https://glyphwiki.org/wiki/u${ucs
                    .codePointAt(0)!
                    .toString(16)
                    .toLowerCase()}`}
                >
                  u{ucs.codePointAt(0)!.toString(16).toLowerCase()} ({ucs}) -
                  GlyphWiki
                </a>
              </li>
              {charIsHan && (
                <>
                  <li>
                    <a
                      href={`https://www.chise.org/est/view/character/${encodeURIComponent(
                        ucs,
                      )}`}
                    >
                      CHISE EsT character = {ucs}
                    </a>
                  </li>
                  <li>
                    <a href={`https://zi.tools/zi/${encodeURIComponent(ucs)}`}>
                      {ucs}: zi.tools
                    </a>
                  </li>
                  <li>
                    <a
                      href={`http://www.unicode.org/cgi-bin/GetUnihanData.pl?codepoint=${ucs
                        .codePointAt(0)!
                        .toString(16)
                        .toUpperCase()}`}
                    >
                      Unihan data for {toCodePoint(ucs)}
                    </a>
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
                        <a href={href}>
                          文字情報基盤検索システム {MJ文字図形名}{' '}
                          <span className="mojidata-mojijoho">
                            {char && ` (${char})`}
                          </span>
                        </a>
                      </li>
                    )
                  })}
                  {cns11643Search && (
                    <li>
                      <a href={cns11643Search.href}>{cns11643Search.title}</a>
                    </li>
                  )}
                </>
              )}
              {学術用変体仮名番号 && (
                <li>
                  <a
                    href={`https://cid.ninjal.ac.jp/kana/detail/${学術用変体仮名番号}/`}
                  >
                    変体仮名 {学術用変体仮名番号} - 学術情報交換用変体仮名 |
                    国立国語研究所
                  </a>
                </li>
              )}
            </ul>
          </>
        )}
        <h3 id="JSON">{getText('json.h3', lang)}</h3>
        <pre>{JSON.stringify(results, null, 2)}</pre>
      </div>
    </article>
  )
}
