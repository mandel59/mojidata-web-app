'use client'

import GetForm from './GetForm'
import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Language, getText } from '@/getText'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'

export interface MojidataSearchFormProps {
  lang: Language
  action?: string
}
export default function MojidataSearchForm(props: MojidataSearchFormProps) {
  const { lang, action = '/search' } = props
  const pathname = usePathname()
  const pathIsIdsfind = pathname.endsWith('/search') || pathname.endsWith('/search-spa')
  const searchParams = useSearchParams()
  const initialQuery = pathIsIdsfind ? searchParams.get('query') ?? '' : ''
  const [query, setQuery] = useState<string>(initialQuery)
  const [showHelp, setShowHelp] = useState(false)
  const [helpTab, setHelpTab] = useState<
    | 'ids'
    | 'reading'
    | 'formal'
    | 'formal-properties'
    | 'formal-properties-unihan-variants'
    | 'formal-properties-unihan-irg'
    | 'formal-properties-unihan-numerics'
    | 'formal-properties-unihan-readings'
    | 'formal-properties-unihan-others'
    | 'formal-properties-unihan-kstrange'
  >('ids')
  return (
    <div className="w-full">
      <GetForm action={action}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              <h2>{getText('mojidata-search.caption', lang)}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border bg-muted/40 p-3">
              <p className="mb-2 text-sm text-muted-foreground">
                {getText('mojidata-search.placeholder', lang)}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  '⿰日月',
                  '＠⿰？月',
                  '：日',
                  'U+21234',
                  'totalStrokes<=5',
                  'mji.読み~カ*',
                  'unihan.kTraditionalVariant=線',
                  'unihan.kStrange.K=カ',
                ].map((example) => (
                  <Button
                    key={example}
                    type="button"
                    size="sm"
                    onClick={() => setQuery(example)}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(true)}
              >
                {getText('usage.summary', lang)}
              </Button>
            </div>
            <Modal
              open={showHelp}
              onClose={() => setShowHelp(false)}
              title={getText('usage.summary', lang)}
            >
              <div className="mb-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={helpTab === 'ids' ? 'default' : 'outline'}
                  onClick={() => setHelpTab('ids')}
                >
                  {getText('usage.tab.ids', lang)}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={helpTab === 'reading' ? 'default' : 'outline'}
                  onClick={() => setHelpTab('reading')}
                >
                  {getText('usage.tab.reading', lang)}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={helpTab === 'formal' ? 'default' : 'outline'}
                  onClick={() => setHelpTab('formal')}
                >
                  {getText('usage.tab.formal', lang)}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={helpTab === 'formal-properties' ? 'default' : 'outline'}
                  onClick={() => setHelpTab('formal-properties')}
                >
                  {getText('usage.tab.formal-properties', lang)}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={helpTab === 'formal-properties-unihan-variants' ? 'default' : 'outline'}
                  onClick={() => setHelpTab('formal-properties-unihan-variants')}
                >
                  {getText('usage.tab.formal-properties-unihan-variants', lang)}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={helpTab === 'formal-properties-unihan-irg' ? 'default' : 'outline'}
                  onClick={() => setHelpTab('formal-properties-unihan-irg')}
                >
                  {getText('usage.tab.formal-properties-unihan-irg', lang)}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={helpTab === 'formal-properties-unihan-numerics' ? 'default' : 'outline'}
                  onClick={() => setHelpTab('formal-properties-unihan-numerics')}
                >
                  {getText('usage.tab.formal-properties-unihan-numerics', lang)}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={helpTab === 'formal-properties-unihan-readings' ? 'default' : 'outline'}
                  onClick={() => setHelpTab('formal-properties-unihan-readings')}
                >
                  {getText('usage.tab.formal-properties-unihan-readings', lang)}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={helpTab === 'formal-properties-unihan-kstrange' ? 'default' : 'outline'}
                  onClick={() => setHelpTab('formal-properties-unihan-kstrange')}
                >
                  {getText('usage.tab.formal-properties-unihan-kstrange', lang)}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={helpTab === 'formal-properties-unihan-others' ? 'default' : 'outline'}
                  onClick={() => setHelpTab('formal-properties-unihan-others')}
                >
                  {getText('usage.tab.formal-properties-unihan-others', lang)}
                </Button>
              </div>

              <table>
                <thead>
                  <tr>
                    {[
                      'formal-properties',
                      'formal-properties-unihan-variants',
                      'formal-properties-unihan-irg',
                      'formal-properties-unihan-numerics',
                      'formal-properties-unihan-readings',
                      'formal-properties-unihan-kstrange',
                      'formal-properties-unihan-others',
                    ].includes(helpTab) ? (
                      <>
                        <th>{getText('property.th', lang)}</th>
                        <th>{getText('operators.th', lang)}</th>
                        <th>{getText('description.th', lang)}</th>
                      </>
                    ) : (
                      <>
                        <th>{getText('query-type.th', lang)}</th>
                        <th>{getText('example.th', lang)}</th>
                        <th>{getText('description.th', lang)}</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {helpTab === 'ids' && (
                    <>
                      <tr>
                        <td>{getText('component-characters.query-type', lang)}</td>
                        <td>日　月</td>
                        <td>{getText('component-characters.description', lang)}</td>
                      </tr>
                      <tr>
                        <td>{getText('component-ids.query-type', lang)}</td>
                        <td>⿰日月</td>
                        <td>{getText('component-ids.description', lang)}</td>
                      </tr>
                      <tr>
                        <td>{getText('whole-ids.query-type', lang)}</td>
                        <td>＠⿰？月</td>
                        <td>{getText('whole-ids.description', lang)}</td>
                      </tr>
                      <tr>
                        <td>{getText('search-character.query-type', lang)}</td>
                        <td>：日</td>
                        <td>{getText('search-character.description', lang)}</td>
                      </tr>
                      <tr>
                        <td>{getText('search-character-kana.query-type', lang)}</td>
                        <td>：あ</td>
                        <td>{getText('search-character-kana.description', lang)}</td>
                      </tr>
                      <tr>
                        <td>{getText('code-point.query-type', lang)}</td>
                        <td>U+21234</td>
                        <td>{getText('code-point.description', lang)}</td>
                      </tr>
                    </>
                  )}

                  {helpTab === 'reading' && (
                    <>
                      <tr>
                        <td>{getText('japanese-kun-reading.query-type', lang)}</td>
                        <td>あか</td>
                        <td>{getText('japanese-kun-reading.description', lang)}</td>
                      </tr>
                      <tr>
                        <td>{getText('japanese-kun-reading-prefix.query-type', lang)}</td>
                        <td>あか＊</td>
                        <td>{getText('japanese-kun-reading-prefix.description', lang)}</td>
                      </tr>
                      <tr>
                        <td>{getText('japanese-on-reading.query-type', lang)}</td>
                        <td>セキ</td>
                        <td>{getText('japanese-on-reading.description', lang)}</td>
                      </tr>
                      <tr>
                        <td>{getText('total-strokes.query-type', lang)}</td>
                        <td>＝１０</td>
                        <td>{getText('total-strokes.description', lang)}</td>
                      </tr>
                      <tr>
                        <td>{getText('total-strokes-range.query-type', lang)}</td>
                        <td>＞＝１　＜＝３</td>
                        <td>{getText('total-strokes-range.description', lang)}</td>
                      </tr>
                      <tr>
                        <td>{getText('mj-database-serial-number.query-type', lang)}</td>
                        <td>MJ052285</td>
                        <td>{getText('mj-database-serial-number.description', lang)}</td>
                      </tr>
                    </>
                  )}

                  {helpTab === 'formal' && (
                    <>
                      <tr>
                        <td>{getText('formal-query-eq.query-type', lang)}</td>
                        <td>unihan.kTraditionalVariant=線</td>
                        <td>{getText('formal-query-eq.description', lang)}</td>
                      </tr>
                      <tr>
                        <td>{getText('formal-query-range.query-type', lang)}</td>
                        <td>totalStrokes&lt;=5</td>
                        <td>{getText('formal-query-range.description', lang)}</td>
                      </tr>
                      <tr>
                        <td>{getText('formal-query-glob.query-type', lang)}</td>
                        <td>mji.読み~カ*</td>
                        <td>{getText('formal-query-glob.description', lang)}</td>
                      </tr>
                    </>
                  )}

                  {helpTab === 'formal-properties' && (
                    <>
                      <tr>
                        <td>UCS</td>
                        <td>=, !=</td>
                        <td>Unicode code point (hex, no U+ prefix)</td>
                      </tr>
                      <tr>
                        <td>totalStrokes</td>
                        <td>=, !=, &lt;=, &gt;=, &lt;, &gt;</td>
                        <td>Total strokes (combined Unihan + MJ)</td>
                      </tr>
                      <tr>
                        <td>mji.読み</td>
                        <td>=, !=, ~, !~</td>
                        <td>Japanese reading (exact / glob)</td>
                      </tr>
                      <tr>
                        <td>mji.読み.prefix</td>
                        <td>=, !=</td>
                        <td>Japanese reading (prefix)</td>
                      </tr>
                      <tr>
                        <td>mji.MJ文字図形名</td>
                        <td>=, !=</td>
                        <td>MJ glyph name</td>
                      </tr>
                      <tr>
                        <td>mji.総画数</td>
                        <td>=, !=, &lt;=, &gt;=, &lt;, &gt;</td>
                        <td>MJ total strokes</td>
                      </tr>
                    </>
                  )}

                  {helpTab === 'formal-properties-unihan-variants' && (
                    <>
                      <tr><td>unihan.kCompatibilityVariant</td><td>=, !=, ~, !~</td><td>Compatibility variant (character / U+XXXX)</td></tr>
                      <tr><td>unihan.kSemanticVariant</td><td>=, !=, ~, !~</td><td>Semantic variant (character / U+XXXX)</td></tr>
                      <tr><td>unihan.kSimplifiedVariant</td><td>=, !=, ~, !~</td><td>Simplified variant (character / U+XXXX)</td></tr>
                      <tr><td>unihan.kSpecializedSemanticVariant</td><td>=, !=, ~, !~</td><td>Specialized semantic variant (character / U+XXXX)</td></tr>
                      <tr><td>unihan.kSpoofingVariant</td><td>=, !=, ~, !~</td><td>Spoofing variant (character / U+XXXX)</td></tr>
                      <tr><td>unihan.kTraditionalVariant</td><td>=, !=, ~, !~</td><td>Traditional variant (character / U+XXXX)</td></tr>
                      <tr><td>unihan.kZVariant</td><td>=, !=, ~, !~</td><td>Z variant (character / U+XXXX)</td></tr>
                    </>
                  )}

                  {helpTab === 'formal-properties-unihan-irg' && (
                    <>
                      <tr><td>unihan.kIRG_GSource</td><td>=, !=, ~, !~</td><td>IRG G source</td></tr>
                      <tr><td>unihan.kIRG_HSource</td><td>=, !=, ~, !~</td><td>IRG H source</td></tr>
                      <tr><td>unihan.kIRG_JSource</td><td>=, !=, ~, !~</td><td>IRG J source</td></tr>
                      <tr><td>unihan.kIRG_KPSource</td><td>=, !=, ~, !~</td><td>IRG KP source</td></tr>
                      <tr><td>unihan.kIRG_KSource</td><td>=, !=, ~, !~</td><td>IRG K source</td></tr>
                      <tr><td>unihan.kIRG_MSource</td><td>=, !=, ~, !~</td><td>IRG M source</td></tr>
                      <tr><td>unihan.kIRG_SSource</td><td>=, !=, ~, !~</td><td>IRG S source</td></tr>
                      <tr><td>unihan.kIRG_TSource</td><td>=, !=, ~, !~</td><td>IRG T source</td></tr>
                      <tr><td>unihan.kIRG_UKSource</td><td>=, !=, ~, !~</td><td>IRG UK source</td></tr>
                      <tr><td>unihan.kIRG_USource</td><td>=, !=, ~, !~</td><td>IRG U source</td></tr>
                      <tr><td>unihan.kIRG_VSource</td><td>=, !=, ~, !~</td><td>IRG V source</td></tr>
                    </>
                  )}

                  {helpTab === 'formal-properties-unihan-numerics' && (
                    <>
                                            <tr><td>unihan.kAccountingNumeric</td><td>=, !=, &lt;=, &gt;=, &lt;, &gt;, ~, !~</td><td>Accounting numeric</td></tr>
                      <tr><td>unihan.kOtherNumeric</td><td>=, !=, &lt;=, &gt;=, &lt;, &gt;, ~, !~</td><td>Other numeric</td></tr>
                      <tr><td>unihan.kPrimaryNumeric</td><td>=, !=, &lt;=, &gt;=, &lt;, &gt;, ~, !~</td><td>Primary numeric</td></tr>
                      <tr><td>unihan.kTayNumeric</td><td>=, !=, &lt;=, &gt;=, &lt;, &gt;, ~, !~</td><td>Tay numeric</td></tr>
                      <tr><td>unihan.kVietnameseNumeric</td><td>=, !=, &lt;=, &gt;=, &lt;, &gt;, ~, !~</td><td>Vietnamese numeric</td></tr>
                      <tr><td>unihan.kZhuangNumeric</td><td>=, !=, &lt;=, &gt;=, &lt;, &gt;, ~, !~</td><td>Zhuang numeric</td></tr>
                    </>
                  )}

                  {helpTab === 'formal-properties-unihan-readings' && (
                    <>
                      <tr><td>unihan.kCantonese</td><td>=, !=, ~, !~</td><td>Cantonese reading</td></tr>
                      <tr><td>unihan.kHangul</td><td>=, !=, ~, !~</td><td>Hangul reading</td></tr>
                      <tr><td>unihan.kHanyuPinlu</td><td>=, !=, ~, !~</td><td>Hanyu Pinlu</td></tr>
                      <tr><td>unihan.kHanyuPinyin</td><td>=, !=, ~, !~</td><td>Hanyu Pinyin</td></tr>
                      <tr><td>unihan.kJapanese</td><td>=, !=, ~, !~</td><td>Japanese reading</td></tr>
                      <tr><td>unihan.kJapaneseKun</td><td>=, !=, ~, !~</td><td>Japanese kun reading</td></tr>
                      <tr><td>unihan.kJapaneseOn</td><td>=, !=, ~, !~</td><td>Japanese on reading</td></tr>
                      <tr><td>unihan.kKorean</td><td>=, !=, ~, !~</td><td>Korean reading</td></tr>
                      <tr><td>unihan.kMandarin</td><td>=, !=, ~, !~</td><td>Mandarin reading</td></tr>
                      <tr><td>unihan.kSMSZD2003Readings</td><td>=, !=, ~, !~</td><td>SMSZD2003 readings</td></tr>
                      <tr><td>unihan.kTang</td><td>=, !=, ~, !~</td><td>Tang reading</td></tr>
                      <tr><td>unihan.kTGHZ2013</td><td>=, !=, ~, !~</td><td>TGHZ 2013 reading</td></tr>
                      <tr><td>unihan.kVietnamese</td><td>=, !=, ~, !~</td><td>Vietnamese reading</td></tr>
                      <tr><td>unihan.kXHC1983</td><td>=, !=, ~, !~</td><td>XHC 1983 reading</td></tr>
                      <tr><td>unihan.kZhuang</td><td>=, !=, ~, !~</td><td>Zhuang reading</td></tr>
                    </>
                  )}

                  {helpTab === 'formal-properties-unihan-others' && (
                    <>
                      <tr><td>unihan.kTotalStrokes</td><td>=, !=, &lt;=, &gt;=, &lt;, &gt;, ~, !~</td><td>Unihan total strokes</td></tr>
                      <tr><td>unihan.kDefinition</td><td>=, !=, ~, !~</td><td>Definition text</td></tr>
                      <tr><td>unihan.kFanqie</td><td>=, !=, ~, !~</td><td>Fanqie</td></tr>
                      <tr><td>unihan.kIICore</td><td>=, !=, ~, !~</td><td>IICore flag</td></tr>
                      <tr><td>unihan.kRSUnicode</td><td>=, !=, ~, !~</td><td>Radical-stroke index</td></tr>
                    </>
                  )}

                  {helpTab === 'formal-properties-unihan-kstrange' && (
                    <>
                      <tr><td>unihan.kStrange</td><td>=, !=, ~, !~</td><td>All kStrange categories</td></tr>
                      <tr><td>unihan.kStrange.A</td><td>=, !=, ~, !~</td><td>Category A: asymmetric structure</td></tr>
                      <tr><td>unihan.kStrange.B</td><td>=, !=, ~, !~</td><td>Category B: visually resembles a bopomofo character</td></tr>
                      <tr><td>unihan.kStrange.C</td><td>=, !=, ~, !~</td><td>Category C: cursive or includes cursive components</td></tr>
                      <tr><td>unihan.kStrange.H</td><td>=, !=, ~, !~</td><td>Category H: includes one or more Hangul components</td></tr>
                      <tr><td>unihan.kStrange.I</td><td>=, !=, ~, !~</td><td>Category I: incomplete form of an existing or possible ideograph</td></tr>
                      <tr><td>unihan.kStrange.K</td><td>=, !=, ~, !~</td><td>Category K: includes components resembling Katakana</td></tr>
                      <tr><td>unihan.kStrange.M</td><td>=, !=, ~, !~</td><td>Category M: mirrored</td></tr>
                      <tr><td>unihan.kStrange.O</td><td>=, !=, ~, !~</td><td>Category O: odd or symbol-like component</td></tr>
                      <tr><td>unihan.kStrange.R</td><td>=, !=, ~, !~</td><td>Category R: rotated</td></tr>
                      <tr><td>unihan.kStrange.S</td><td>=, !=, ~, !~</td><td>Category S: stroke-heavy (40+ strokes)</td></tr>
                      <tr><td>unihan.kStrange.U</td><td>=, !=, ~, !~</td><td>Category U: unusual arrangement/structure</td></tr>
                      <tr><td>unihan.kStrange.Y</td><td>=, !=, ~, !~</td><td>Category Y: symmetric (mirrored/unmirrored components arranged side-by-side or stacked)</td></tr>
                    </>
                  )}
                </tbody>
              </table>
            </Modal>
            <div key="query" className="mt-2">
              <label htmlFor="mojidata-query-input" className="sr-only">
                {getText('mojidata-search.placeholder', lang)}
              </label>
              <Input
                id="mojidata-query-input"
                name="query"
                value={query}
                placeholder={getText('mojidata-search.placeholder', lang)}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <footer className="mt-3 flex justify-start border-t border-border pt-3">
              <Button type="submit">{getText('search.button', lang)}</Button>
            </footer>
          </CardContent>
        </Card>
      </GetForm>
    </div>
  )
}
