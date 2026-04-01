import { ReactElement, ReactNode } from 'react'
import {
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
} from '@/mojidata/mojidataShared'
import type { MojidataResults } from '@/mojidata/mojidataShared'
import './styles.css'
import styles from './MojidataResponseView.module.css'
import Link from 'next/link'
import GlyphWikiCharImg from '@/components/GlyphWikiCharImg'
import DeferredCharSvgImage from '@/components/DeferredCharSvgImage'
import { Language, getText } from '@/getText'
import MojidataDeferredVariants from '@/components/MojidataDeferredVariants'
import MojidataMojiJohoSection from '@/components/MojidataMojiJohoSection'
import MojidataPermalinkButton from '@/components/MojidataPermalinkButton'
import MojidataSectionNav from '@/components/MojidataSectionNav'
import type { MojidataVariantEntry } from '@/components/mojidataVariantEntry'
import mojiJohoStyles from '@/components/MojiJohoChar.module.css'

const langTags = ['zh-CN', 'zh-TW', 'zh-HK', 'ja-JP', 'ko-KR'] as const
const irgKeys = {
  'zh-CN': 'kIRG_GSource',
  'zh-TW': 'kIRG_TSource',
  'zh-HK': 'kIRG_HSource',
  'ja-JP': 'kIRG_JSource',
  'ko-KR': 'kIRG_KSource',
} as const

const INITIAL_VARIANT_RENDER_COUNT = 6

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
    return (
      <Link href={href} prefetch={false}>
        {children}
      </Link>
    )
  } else {
    return <span>{children}</span>
  }
}

export interface MojidataResponseViewParams {
  ucs: string
  results: MojidataResults
  canonicalCharacter: MojidataResults
  compatibilityCharacters?: MojidataResults[]
  isCompatibilityCharacter: boolean
  bot: boolean
  disableExternalLinks: boolean
  forceMojiJohoImage: boolean
  lang: Language
}
export default function MojidataResponseView(
  params: MojidataResponseViewParams,
): ReactElement {
  const {
    ucs,
    results,
    canonicalCharacter,
    compatibilityCharacters,
    isCompatibilityCharacter,
    bot,
    disableExternalLinks,
    forceMojiJohoImage,
    lang,
  } = params

  const mojidataHref = (char: string) => `/mojidata/${encodeURIComponent(char)}`
  const idsfindHref = (whole: string) =>
    `/idsfind?whole=${encodeURIComponent(whole)}`

  const charIsHan =
    /[\p{Script=Han}\u{20000}-\u{2FFFD}\u{30000}-\u{3FFFD}]/u.test(results.char)

  const charIsHentaigana = results.mjih[0]?.文字 === results.char
  const 学術用変体仮名番号 = charIsHentaigana
    ? results.mjih[0]?.学術用変体仮名番号 ?? undefined
    : undefined

  const svs = results.svs_cjkci.find(
    (record) => record.CJKCI_char === results.char,
  )

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
  )
    .filter((char) => char !== results.char)
    .sort((x, y) => compareString(x, y))

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

  const rsUnicodeList = results.unihan_rs?.kRSUnicode
  const rsSummary =
    rsUnicodeList && rsUnicodeList.length > 0
      ? rsUnicodeList
          .map((entry) => {
            const [, inner, radicalChar, rawRadical] = entry
            return `${rawRadical}.${inner} (${radicalChar}部${inner}画)`
          })
          .join(' / ')
      : results.unihan.kRSUnicode
  const totalStrokes = results.unihan.kTotalStrokes

  const compactReading = (value?: string) =>
    value
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .join(' / ')

  const unihanAny = results.unihan as Record<string, string | undefined>
  const readings = [
    {
      label: getText('summary.japanese.dt', lang),
      value: compactReading(unihanAny.kJapanese),
    },
    {
      label: getText('summary.mandarin.dt', lang),
      value: compactReading(results.unihan.kMandarin),
    },
    {
      label: getText('summary.cantonese.dt', lang),
      value: compactReading(results.unihan.kCantonese),
    },
    {
      label: getText('summary.korean.dt', lang),
      value: compactReading(results.unihan.kKorean),
    },
    {
      label: getText('summary.vietnamese.dt', lang),
      value: compactReading(results.unihan.kVietnamese),
    },
  ].filter((row) => row.value)


  const tghbNormalizedChars = new Set(results.tghb.map((record) => record.规范字))
  const tghbTraditionalChars = new Set(
    results.tghb.flatMap((record) =>
      record.异体字
        .filter((variant) => variant.繁体字 === variant.异体字)
        .map((variant) => variant.繁体字),
    ),
  )
  const tghbVariantChars = new Set(
    results.tghb.flatMap((record) => record.异体字.map((variant) => variant.异体字)),
  )

  const isTghbNormalized = tghbNormalizedChars.has(results.char)
  const isTghbTraditional = tghbTraditionalChars.has(results.char)
  const isTghbVariant =
    !isTghbNormalized && !isTghbTraditional && tghbVariantChars.has(results.char)

  const summaryBadges = [
    isCompatibilityCharacter ? getText('summary.compatibility.badge', lang) : null,
    isTghbNormalized ? 'tghb: 规范字' : null,
    isTghbTraditional ? 'tghb: 繁体字' : null,
    isTghbVariant ? 'tghb: 异体字' : null,
    results.joyo.length > 0 ? 'joyo: 常用漢字' : null,
  ].filter((badge): badge is string => Boolean(badge))

  const tocSections = [
    { id: 'Character_Data', label: getText('character-data.h2', lang) },
    { id: 'Glyph_Comparison', label: getText('glyph-comparison.h3', lang) },
    {
      id: 'Variants',
      label: getText('variants-and-relevant-characters.h3', lang),
    },
    ...(disableExternalLinks
      ? []
      : [{ id: 'External_Links', label: getText('external-links.h3', lang) }]),
    { id: 'JSON', label: getText('json.h3', lang) },
  ]

  const variantEntries: MojidataVariantEntry[] = allVariantChars.map((char) => {
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

    const relationLines = [
      unihanRelations && {
        label: '→unihan',
        values: [...unihanRelations].join(', '),
      },
      unihanInverseRelations && {
        label: '←unihan',
        values: [...unihanInverseRelations].join(', '),
      },
      joyoRelations && {
        label: '→joyo',
        values: [...joyoRelations].join(', '),
      },
      kdpvForwardRelations.length > 0 && {
        label: '→kdpv',
        values: kdpvForwardRelations.join(', '),
      },
      kdpvBackwardRelations.length > 0 && {
        label: '←kdpv',
        values: kdpvBackwardRelations.map((r) => r.slice(1)).join(', '),
      },
      mjsmRelations && {
        label: '→mjsm',
        values: [...mjsmRelations].join(', '),
      },
      mjsmInverseRelations && {
        label: '←mjsm',
        values: [...mjsmInverseRelations].join(', '),
      },
      nyukanRelations && {
        label: '→nyukan',
        values: [...nyukanRelations].join(', '),
      },
      nyukanInverseRelations && {
        label: '←nyukan',
        values: [...nyukanInverseRelations].join(', '),
      },
      tghbRelations && {
        label: '→tghb',
        values: [...tghbRelations].join(', '),
      },
      babelStoneIdsRelations && {
        label: '→ids',
        values: [...babelStoneIdsRelations].join(', '),
      },
      idsInverseRelations && {
        label: '←ids',
        values: [...idsInverseRelations].join(', '),
      },
      hentaiganaRelations && {
        label: '→mjih',
        values: [...hentaiganaRelations].join(', '),
      },
      ivsDuplicateRelations && {
        label: '→ivs',
        values: [...ivsDuplicateRelations].join(', '),
      },
    ].filter(Boolean) as MojidataVariantEntry['relationLines']

    return {
      key: char,
      heading: charName === char ? charName : `${charName} ${char}`,
      char,
      href: codePoint
        ? mojidataHref(codePoint)
        : isIDS
        ? idsfindHref(char)
        : undefined,
      className: [
        isIDS || isNonStandardVariant ? 'mojidata-kdpv-char' : 'mojidata-char',
        isIDS || codePoint ? 'mojidata-char-link' : '',
        codePoint ? 'mojidata-char-glyphwiki' : '',
      ].join(' '),
      useGlyphImage: !!codePoint && !bot,
      relationLines,
    }
  })
  const initialVariantEntries = variantEntries.slice(
    0,
    INITIAL_VARIANT_RENDER_COUNT,
  )
  const deferredVariantEntries = variantEntries.slice(
    INITIAL_VARIANT_RENDER_COUNT,
  )


  return (
    <article className={styles.article}>
      <div className={`mojidata-response ${styles.response}`}>
        <section className={`mojidata-summary-wrap ${styles.summaryWrap}`}>
          <div className={`mojidata-summary-actions ${styles.summaryActions}`}>
            <MojidataPermalinkButton lang={lang} />
          </div>
          <div className={`mojidata-summary-grid ${styles.summaryGrid}`}>
            <div className={`mojidata-summary-glyph-col ${styles.summaryGlyphCol}`}>
              <div className="mojidata-char mojidata-char-glyphwiki" lang="ja">
                {bot ? (
                  results.char
                ) : (
                  <GlyphWikiCharImg
                    char={results.char}
                    size={110}
                    alt={results.char}
                    loading="eager"
                    fetchPriority="high"
                  />
                )}
              </div>
              {summaryBadges.length > 0 && (
                <div className={`mojidata-summary-badge-row ${styles.summaryBadgeRow}`}>
                  {summaryBadges.map((badge) => (
                    <span key={badge} className={`mojidata-badge ${styles.badge}`}>
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <dl className={`mojidata-summary-kv ${styles.summaryKv}`}>
              <div className={`mojidata-summary-row ${styles.summaryRow}`}>
                <dt>{getText('summary.unicode.dt', lang)}</dt>
                <dd>
                  {results.UCS} {results.char}
                </dd>
              </div>
            {rsSummary && (
              <div className={`mojidata-summary-row ${styles.summaryRow}`}>
                <dt>{getText('summary.rs-index.dt', lang)}</dt>
                <dd>{rsSummary}</dd>
              </div>
            )}
            {totalStrokes && (
              <div className={`mojidata-summary-row ${styles.summaryRow}`}>
                <dt>{getText('summary.total-strokes.dt', lang)}</dt>
                <dd>{totalStrokes}</dd>
              </div>
            )}
            {readings.map((row) => (
              <div className={`mojidata-summary-row ${styles.summaryRow}`} key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          </div>
        </section>

        <div className={`mojidata-content-grid ${styles.contentGrid}`}>
          <MojidataSectionNav sections={tocSections} anchorKey={results.char} />
          <div className={`mojidata-content-main ${styles.contentMain}`}>
            <h2 id="Character_Data">{getText('character-data.h2', lang)}</h2>
        {isCompatibilityCharacter && (
          <>
            <h3 id="Unified_Ideograph">{getText('unified-ideograph.h3', lang)}</h3>
            <div className="mojidata-chars-comparison">
              <figure>
                <figcaption>
                  {canonicalCharacter.UCS} {canonicalCharacter.char}
                </figcaption>
                <div className="mojidata-char mojidata-char-link mojidata-char-glyphwiki" lang="ja">
                  <Link href={mojidataHref(canonicalCharacter.char)}>
                    {bot ? (
                      canonicalCharacter.char
                    ) : (
                      <DeferredCharSvgImage
                        char={canonicalCharacter.char}
                        size={110}
                        alt={canonicalCharacter.char}
                        source="glyphwiki"
                      />
                    )}
                  </Link>
                </div>
              </figure>
            </div>
          </>
        )}
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
                      <small>
                        {toCodePoints(record.SVS_char)} {record.SVS_char}
                      </small>
                    </figcaption>
                    <div
                      className="mojidata-char mojidata-char-link mojidata-char-glyphwiki"
                      lang="ja"
                    >
                      <Link href={mojidataHref(record.CJKCI_char)}>
                        {bot ? (
                          record.CJKCI_char
                        ) : (
                          <DeferredCharSvgImage
                            char={record.CJKCI_char}
                            size={110}
                            alt={record.CJKCI}
                            source="glyphwiki"
                          />
                        )}
                      </Link>
                    </div>
                  </figure>
                )
              })}
            </div>
          </>
        )}
        {charIsHan && results.ids.length > 0 && (
          <>
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
          </>
        )}
        <h2 id="Glyph_Comparison">{getText('glyph-comparison.h3', lang)}</h2>
        {charIsHan && (
          <>
            <h3 id="Regional_Differences">
              {getText('regional-differences.h4', lang)}
            </h3>
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
            <h3 id="Adobe-Japan1">{getText('adobe-japan1.h4', lang)}</h3>
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
          </>
        )}
        <MojidataMojiJohoSection
          lang={lang}
          ucs={ucs}
          bot={bot}
          initialForceImage={forceMojiJohoImage}
          isJISX0213char={isJISX0213char}
          mji={mji}
          mjih={results.mjih}
        />
        <h2 id="Variants">
          {getText('variants-and-relevant-characters.h3', lang)}
        </h2>
        {variantEntries.length > 0 && (
          <div className="mojidata-chars-comparison mojidata-variants-comparison">
            {initialVariantEntries.map((entry) => (
              <figure key={entry.key}>
                <figcaption>
                  <div>{entry.heading}</div>
                  {entry.relationLines.map((line) => (
                    <div key={`${entry.key}:${line.label}`}>
                      <small>
                        {line.label}: {line.values}
                      </small>
                    </div>
                  ))}
                </figcaption>
                <div className={entry.className}>
                  <ConditionalLink href={entry.href}>
                    {entry.useGlyphImage ? (
                      <DeferredCharSvgImage
                        char={entry.char}
                        size={110}
                        alt={entry.char}
                        source="glyphwiki"
                      />
                    ) : (
                      entry.char
                    )}
                  </ConditionalLink>
                </div>
              </figure>
            ))}
          </div>
        )}
        <MojidataDeferredVariants lang={lang} entries={deferredVariantEntries} />
        {!disableExternalLinks && (
          <>
            <h2 id="External_Links">{getText('external-links.h3', lang)}</h2>
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
                          <span
                            className={`mojidata-mojijoho ${mojiJohoStyles.mojiJoho}`}
                          >
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
            <h2 id="JSON">{getText('json.h3', lang)}</h2>
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        </div>
      </div>
    </article>
  )
}
