export interface MojidataResults {
  char: string
  UCS: string
  aj1: {
    CID: number
  }
  ids: Array<{
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
  svs_cjkci: Array<{
    SVS_char: string
    SVS: string
    CJKCI_char: string
    CJKCI: string
  }>
  unihan: Partial<Record<UnihanPropertyName, string>>
  unihan_variant: Array<
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
    '部首・内画数': Array<[radical: number, strokes: number]>
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

export type UnihanPropertyName = typeof unihanProperties[number]

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

export type MjsmTableName = typeof mjsmTables[number]

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

export type KdpvRelation = typeof kdpvRelations[number]

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

export function getKdpvVariants(results: MojidataResults) {
  const m = new Map<string, Set<KdpvRelation>>()
  for (const [relation, kdpvChars] of Object.entries(results.kdpv)) {
    for (const kdpvChar of kdpvChars) {
      if (!m.has(kdpvChar)) {
        m.set(kdpvChar, new Set())
      }
      m.get(kdpvChar)!.add(relation as KdpvRelation)
    }
  }
  return m
}

export function getUnihanVariants(results: MojidataResults) {
  const m = new Map<string, Set<UnihanPropertyName>>()
  for (const [
    unihanPropertyName,
    _codePoint,
    char,
    _additionalData,
  ] of results.unihan_variant) {
    if (!m.has(char)) {
      m.set(char, new Set())
    }
    m.get(char)!.add(unihanPropertyName)
  }
  return m
}
