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
                {['⿰日月', '＠⿰？月', '：日', 'U+21234'].map((example) => (
                  <Button
                    key={example}
                    type="button"
                    variant="outline"
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
              <table>
                <thead>
                  <tr>
                    <th>{getText('query-type.th', lang)}</th>
                    <th>{getText('example.th', lang)}</th>
                    <th>{getText('description.th', lang)}</th>
                  </tr>
                </thead>
                <tbody>
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
