import { getApiHeaders, getApiUrl, getRevalidateDuration } from '@/app/config'
import { customFetch } from '@/customFetch'
import { version } from '@/settings'

export interface MojidataResults {
  char: string
  UCS: string
  aj1: {
    CID: number
    jp90: number
    jp90_V: number | null
    jp04: number
    jp04_V: number | null
    mac_jp90: number
    mac_jp90_V: number | null
    mac_jp04: number
    mac_jp04_V: number | null
  } | null
  ids: Array<{
    IDS: string
    source: string
  }>
  ids_similar: Array<{
    UCS: string
    IDS: string
    source: string
  }>
  ids_comment: string[]
  ivs: Array<{
    char: string
    IVS: string
    collection: string
    code: string
  }>
  ivs_duplicate: [
    ivs1: string,
    char1: string,
    ivs2: string,
    char2: string,
    collection: string,
    code: string,
  ][]
  svs_cjkci: Array<{
    SVS_char: string
    SVS: string
    CJKCI_char: string
    CJKCI: string
  }>
  unihan: Partial<Record<UnihanPropertyName, string>>
  unihan_rs?: {
    kRSAdobe_Japan1_6: [
      radical: number,
      strokes: number,
      radicalChar: string,
      radicalStrokes: number,
      CID: string,
    ][]
    kRSUnicode: [
      radical: number,
      strokes: number,
      radicalChar: string,
      rawRadical: string,
    ][]
  }
  unihan_fts: [
    codePoint: string,
    char: string,
    unihanProperty: UnihanPropertyName,
    value: string,
  ][]
  unihan_variant: Array<
    [
      unihanProperty: UnihanPropertyName,
      codePoint: string,
      char: string,
      additionalData?: string,
    ]
  >
  unihan_variant_inverse: Array<
    [
      unihanProperty: UnihanPropertyName,
      codePoint: string,
      char: string,
      additionalData?: string,
    ]
  >
  joyo: Array<{
    音訓: string
    例: string[]
    備考: string
  }>
  joyo_kangxi: string[]
  joyo_kangxi_inverse: string[]
  doon: Array<{
    書きかえる漢語: string
    書きかえた漢語: string
    採用した文書: string
  }>
  nyukan: Array<{
    正字の種類: '異体字' | '類字'
    簡体字等の文字コード等: string
    簡体字等のUCS: string | null
    正字の文字コード等: string
    正字のUCS: string
    順位: 1 | 2
  }>
  tghb: Array<{
    序号: string
    规范字: string
    级: 1 | 2 | 3
    笔画: number
    註解: string | null
    异体字: Array<{
      繁体字: string
      异体字: string
      註解: string | null
    }>
  }>
  mji: Array<{
    文字: string
    MJ文字図形名: string
    対応するUCS: string | null
    実装したUCS: string | null
    実装したMoji_JohoコレクションIVS: string | null
    実装したSVS: string | null
    戸籍統一文字番号: string | null
    住基ネット統一文字コード: string | null
    入管正字コード: string | null
    入管外字コード: string | null
    漢字施策: '常用漢字' | '人名用漢字' | null
    対応する互換漢字: string | null
    X0213: string | null
    X0213_包摂連番: string | null
    X0213_包摂区分: 0 | 2 | null
    X0212: string | null
    MJ文字図形バージョン: string
    登記統一文字番号: string | null
    '部首・内画数': [
      radical: number,
      strokes: number | '-',
      radicalChar?: string,
    ][]
    総画数: number
    読み: string[]
    大漢和: number | null
    日本語漢字辞典: number | null
    新大字典: number | null
    大字源: number | null
    大漢語林: number | null
    更新履歴: string[]
    備考: string | null
    mjsm: [table: MjsmTableName, codePoint: string, char: string][]
  }>
  mjsm_inverse: Array<{
    表: MjsmTableName
    文字: string
    MJ文字図形名: string
    対応するUCS: string | null
    実装したUCS: string | null
    実装したMoji_JohoコレクションIVS: string | null
    実装したSVS: string | null
  }>
  mjih: Array<{
    MJ文字図形名: string
    文字: string | null
    CharacterName: string | null
    UCS符号位置: string | null
    字母: string
    字母のUCS符号位置: string
    音価: string[]
    戸籍統一文字番号: string | null
    学術用変体仮名番号: string | null
    国語研URL: string | null
    備考: string | null
  }>
  kdpv: Partial<Record<KdpvRelation, string[]>>
}

export const unihanProperties = [
  'kHanYu',
  'kIRGHanyuDaZidian',
  'kIRGKangXi',
  'kKangXi',
  'kCihaiT',
  'kSBGY',
  'kNelson',
  'kCowles',
  'kMatthews',
  'kGSR',
  'kFennIndex',
  'kKarlgren',
  'kMeyerWempe',
  'kLau',
  'kCheungBauerIndex',
  'kMorohashi',
  'kDaeJaweon',
  'kIRGDaeJaweon',
  'kIRGDaiKanwaZiten',
  'kCangjie',
  'kStrange',
  'kPhonetic',
  'kFenn',
  'kUnihanCore2020',
  'kCheungBauer',
  'kAlternateTotalStrokes',
  'kFourCornerCode',
  'kFrequency',
  'kGradeLevel',
  'kHDZRadBreak',
  'kHKGlyph',
  'kIRG_GSource',
  'kIRG_JSource',
  'kIRG_TSource',
  'kRSUnicode',
  'kTotalStrokes',
  'kIRG_KSource',
  'kIRG_KPSource',
  'kIRG_VSource',
  'kIRG_HSource',
  'kIRG_USource',
  'kIICore',
  'kIRG_MSource',
  'kIRG_UKSource',
  'kCompatibilityVariant',
  'kIRG_SSource',
  'kOtherNumeric',
  'kPrimaryNumeric',
  'kAccountingNumeric',
  'kJIS0213',
  'kKPS1',
  'kHKSCS',
  'kTGH',
  'kKoreanName',
  'kEACC',
  'kTaiwanTelegraph',
  'kJa',
  'kKPS0',
  'kBigFive',
  'kCCCII',
  'kCNS1986',
  'kCNS1992',
  'kGB0',
  'kGB1',
  'kJis0',
  'kJoyoKanji',
  'kKSC0',
  'kKoreanEducationHanja',
  'kMainlandTelegraph',
  'kXerox',
  'kGB5',
  'kJis1',
  'kPseudoGB1',
  'kGB3',
  'kGB8',
  'kJinmeiyoKanji',
  'kKSC1',
  'kIBMJapan',
  'kGB7',
  'kRSAdobe_Japan1_6',
  'kRSKangXi',
  'kCantonese',
  'kDefinition',
  'kMandarin',
  'kHanyuPinyin',
  'kTGHZ2013',
  'kXHC1983',
  'kVietnamese',
  'kHangul',
  'kTang',
  'kJapaneseKun',
  'kJapaneseOn',
  'kHanyuPinlu',
  'kKorean',
  'kSemanticVariant',
  'kSpoofingVariant',
  'kTraditionalVariant',
  'kSimplifiedVariant',
  'kSpecializedSemanticVariant',
  'kZVariant',
] as const

export type UnihanPropertyName = (typeof unihanProperties)[number]

const mjsmTables = [
  'JIS包摂規準UCS統合規則',
  '戸籍統一文字情報_親字正字',
  '民一2842号通達別表_誤字俗字正字一覧表_俗字',
  '民一2842号通達別表_誤字俗字正字一覧表_別字',
  '民一2842号通達別表_誤字俗字正字一覧表_無印',
  '民二5202号通知別表_正字俗字等対照表',
  '法務省告示582号別表第四_一',
  '法務省告示582号別表第四_二',
  '読み字形による類推',
  '辞書類等による関連字',
] as const

export type MjsmTableName = (typeof mjsmTables)[number]

const kdpvRelations = [
  'cjkvi/duplicate',
  'cjkvi/non-cognate',
  'cjkvi/numeric',
  'cjkvi/pseudo-simplified',
  'cjkvi/radical-proper',
  'cjkvi/radical-split',
  'cjkvi/radical-variant',
  'cjkvi/radical-variant-simplified',
  'cjkvi/simplified',
  'cjkvi/traditional',
  'cjkvi/variant',
  'cjkvi/variant-simplified',
  'dypytz/proper',
  'dypytz/variant',
  'dypytz/variant/1956',
  'dypytz/variant/1986',
  'dypytz/variant/1988',
  'dypytz/variant/1993',
  'dypytz/variant/1997',
  'hydcd/borrowed',
  'hydzd/proper',
  'hydzd/simplified',
  'hydzd/traditional',
  'hydzd/variant',
  'hyogai/proper',
  'hyogai/variant',
  'jinmei1/proper',
  'jinmei1/variant',
  'jinmei2/proper',
  'jinmei2/variant',
  'jisx0212/variant',
  'jisx0213/variant',
  'joyo/proper',
  'joyo/variant',
  'jp/borrowed',
  'jp/borrowed-reverse',
  'jp/new-style',
  'jp/old-style',
  'jp/old-style/compat',
  'koseki/proper',
  'koseki/variant',
  'non-cjk/bopomofo',
  'non-cjk/bracketed',
  'non-cjk/circle',
  'non-cjk/hangzhou-num',
  'non-cjk/kanbun',
  'non-cjk/kangxi',
  'non-cjk/katakana',
  'non-cjk/parenthesized',
  'non-cjk/proper',
  'non-cjk/radical',
  'non-cjk/square',
  'non-cjk/strokes',
  'sawndip/regular',
  'sawndip/variant',
  'twedu/regular',
  'twedu/variant',
  'ucs-scs/variant',
  'x0212-x0213/variants',
  'x0213-x0212/variants',
  '~cjkvi/pseudo-simplified',
  '~cjkvi/radical-split',
  '~cjkvi/radical-variant-simplified',
  '~cjkvi/simplified',
  '~cjkvi/traditional',
  '~cjkvi/variant-simplified',
] as const

export type KdpvRelation = (typeof kdpvRelations)[number]

export async function fetchMojidata(char: string) {
  const url = new URL(getApiUrl('/api/v1/mojidata'))
  url.searchParams.set('char', char)
  // dummy query to avoid cache for older versions
  url.searchParams.set('_v', version)
  const res = await customFetch(url, {
    next: {
      revalidate: getRevalidateDuration(),
    },
    headers: {
      Accept: 'application/json',
      ...getApiHeaders(),
    },
  })
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.statusText}, url: ${url.href}`)
  }
  const responseBody = await res.json()
  const { results }: { results: MojidataResults } = responseBody
  return results
}

export function toCodePoint(c: string): string {
  const codePoint = c.codePointAt(0)!
  return 'U+' + codePoint.toString(16).toUpperCase().padStart(4, '0')
}

const idsOperatorPattern = /[〾↔↷⿰⿱⿴⿵⿶⿷⿸⿹⿺⿻⿲⿳]/u

export function getCharNameOfKdpvChar(kdpvChar: string): string {
  if (kdpvCharIsIDS(kdpvChar) || kdpvCharIsNonStandardVariant(kdpvChar)) {
    return kdpvChar
  }
  const chars = [...kdpvChar]
  return chars.map((c) => toCodePoint(c)).join(' ')
}

export function getCodePointOfKdpvChar(kdpvChar: string): string | undefined {
  const firstCodePoint = kdpvChar.codePointAt(0)
  if (firstCodePoint == null) {
    throw new Error('Invalid character')
  }
  if (kdpvCharIsIDS(kdpvChar)) {
    return undefined
  }
  const firstChar = String.fromCodePoint(firstCodePoint)
  return firstChar
}

export function kdpvCharIsIDS(kdpvChar: string): boolean {
  return idsOperatorPattern.test(kdpvChar)
}

export function kdpvCharIsNonStandardVariant(kdpvChar: string): boolean {
  return /[\[\]［］]/u.test(kdpvChar)
}

function add<K, T>(m: Map<K, Set<T>>, key: K, value: T) {
  if (key == null) {
    throw new Error(`Invalid key: ${key}, value: ${value}`)
  }
  if (!m.has(key)) {
    m.set(key, new Set())
  }
  m.get(key)!.add(value)
}

export function getKdpvVariants(results: MojidataResults) {
  const m = new Map<string, Set<KdpvRelation>>()
  for (const [relation, kdpvChars] of Object.entries(results.kdpv)) {
    for (const kdpvChar of kdpvChars) {
      add(m, kdpvChar, relation as KdpvRelation)
    }
  }
  return m
}

const excludedProperties = ['kJapanese', 'kSMSZD2003Readings', 'kFanqie']

export function getUnihanVariants(results: MojidataResults) {
  const m = new Map<string, Set<string>>()
  const s = new Map<string, Set<string>>()
  for (const [
    unihanProperty,
    _codePoint,
    char,
    additionalData,
  ] of results.unihan_variant) {
    const rel = additionalData
      ? `${unihanProperty}[${additionalData}]`
      : unihanProperty
    add(m, char, rel)
    add(s, char, unihanProperty)
  }
  for (const [unihanProperty, value] of Object.entries(results.unihan)) {
    if (excludedProperties.includes(unihanProperty)) continue
    for (let [char] of value.matchAll(
      /U\+[0-9A-F]+|[\p{sc=Han}\u{20000}-\u{3FFFF}]/gu,
    )) {
      if (char.startsWith('U+')) {
        char = String.fromCodePoint(parseInt(char.slice(2), 16))
      }
      if (char === results.char) continue
      if (s.get(char)?.has(unihanProperty)) continue
      add(m, char, `${unihanProperty}[${value}]`)
    }
  }
  return m
}

export function getUnihanInverseVariants(results: MojidataResults) {
  const m = new Map<string, Set<string>>()
  const s = new Map<string, Set<string>>()
  for (const [
    unihanProperty,
    _codePoint,
    char,
    additionalData,
  ] of results.unihan_variant_inverse) {
    const rel = additionalData
      ? `${unihanProperty}[${additionalData}]`
      : unihanProperty
    add(m, char, rel)
    add(s, char, unihanProperty)
  }
  for (const [_codePoint, char, unihanProperty, value] of results.unihan_fts) {
    if (char === results.char) continue
    if (s.get(char)?.has(unihanProperty)) continue
    add(m, char, `${unihanProperty}[${value}]`)
  }
  return m
}

export function getMjsmVariants(results: MojidataResults) {
  const m = new Map<string, Set<MjsmTableName>>()
  for (const { 実装したUCS, mjsm } of results.mji) {
    if (実装したUCS !== results.UCS) continue
    for (const [table, _codePoint, char] of mjsm) {
      add(m, char, table)
    }
  }
  return m
}

export function getMjsmInverseVariants(results: MojidataResults) {
  const m = new Map<string, Set<MjsmTableName>>()
  for (const { 表: table, 実装したUCS } of results.mjsm_inverse) {
    if (実装したUCS == null) continue
    const char = String.fromCodePoint(parseInt(実装したUCS.slice(2), 16))
    add(m, char, table)
  }
  return m
}

export function getTghbVariants(results: MojidataResults) {
  const m = new Map<string, Set<string>>()
  const char = results.char
  for (const { 规范字, 异体字: variants } of results.tghb) {
    add(m, 规范字, '规范字')
    for (const { 繁体字, 异体字 } of variants) {
      if (char === 规范字 || char === 繁体字 || char === 异体字) {
        add(m, 繁体字, '繁体字')
      }
      if (
        char !== 异体字 &&
        繁体字 !== 异体字 &&
        (char === 规范字 || char === 繁体字)
      ) {
        add(m, 异体字, '异体字')
      }
    }
  }
  return m
}

export function getNyukanVariants(results: MojidataResults) {
  const m = new Map<string, Set<string>>()
  const char = results.char
  for (const { 正字の種類, 正字のUCS, 簡体字等のUCS } of results.nyukan) {
    if (簡体字等のUCS === char) {
      add(m, 正字のUCS, 正字の種類)
    }
  }
  return m
}

export function getNyukanInverseVariants(results: MojidataResults) {
  const m = new Map<string, Set<string>>()
  const char = results.char
  for (const { 正字の種類, 正字のUCS, 簡体字等のUCS } of results.nyukan) {
    if (正字のUCS === char) {
      if (簡体字等のUCS != null) {
        add(m, 簡体字等のUCS, 正字の種類)
      }
    }
  }
  return m
}

export function getJoyoVariants(results: MojidataResults) {
  const m = new Map<string, Set<string>>()
  for (const kangxi of results.joyo_kangxi) {
    add(m, kangxi, 'いわゆる康熙字典体')
  }
  for (const joyo of results.joyo_kangxi_inverse) {
    add(m, joyo, '常用漢字')
  }
  return m
}

export function getCns11643Search(results: MojidataResults) {
  const codePoint = results.char.codePointAt(0)?.toString(16).padStart(4, '0')
  const defaultSearch = {
    title: `[${results.char}] - 字形資訊 - CNS11643 全字庫`,
    href: `https://www.cns11643.gov.tw/search.jsp?ID=12&UNI=${codePoint}&UNI2=`,
  }
  const tSource = results.unihan.kIRG_TSource
  if (tSource == null) return defaultSearch
  const [t1, t2] = tSource.split('-')
  if (t1 === 'TU') {
    return defaultSearch
  } else {
    const cPage = parseInt(t1.slice(1), 16)
    const SN = t2
    return {
      title: `[${results.char}] ${cPage}-${SN} - 字形資訊 - CNS11643 全字庫`,
      href: `https://www.cns11643.gov.tw/search.jsp?ID=6&CPG=${cPage}&CNUM=${SN}&CNUM2=`,
    }
  }
}

export function getBabelStoneIdsVariants(results: MojidataResults) {
  const m = new Map<string, Set<string>>()
  for (const comment of results.ids_comment) {
    for (const [_codePoint, hex] of comment.matchAll(/U\+([0-9A-F]+)/g)) {
      const char = String.fromCodePoint(parseInt(hex, 16))
      if (char === results.char) continue
      add(m, char, comment)
    }
  }
  for (const { IDS } of results.ids) {
    if (/^[〾↔↷].$/u.test(IDS)) {
      add(m, String.fromCodePoint(IDS.codePointAt(1)!), IDS)
    }
  }
  return m
}

export function getBabelStoneIdsInverseVariants(results: MojidataResults) {
  const m = new Map<string, Set<string>>()
  for (const { UCS, IDS } of results.ids_similar) {
    add(m, UCS, IDS)
  }
  return m
}

export function getHentaigana(results: MojidataResults) {
  const m = new Map<string, Set<string>>()
  for (const { 文字, 字母, 音価 } of results.mjih) {
    if (文字 == null) continue
    if (results.char === 字母) {
      add(m, 文字, `変体仮名[音価:${音価}]`)
    } else if (results.char === 文字) {
      add(m, 字母, `字母`)
      for (const p of 音価) {
        add(m, p, `音価`)
      }
    } else {
      add(m, 文字, `変体仮名[字母:${字母}]`)
    }
  }
  return m
}

export function getIvsDuplicates(results: MojidataResults) {
  const m = new Map<string, Set<string>>()
  for (const [
    ivs1,
    _char1,
    ivs2,
    char2,
    collection,
    code,
  ] of results.ivs_duplicate) {
    add(m, char2, `duplicate[${collection},${code},${ivs1}=${ivs2}]`)
  }
  return m
}
