'use client'

import MultiInput from './MultiInput'
import GetForm from './GetForm'
import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Language, getText } from '@/getText'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface IdsFinderProps {
  lang: Language
  action?: string
}
export default function IdsFinder(props: IdsFinderProps) {
  const { lang, action = '/idsfind' } = props
  const pathname = usePathname()
  const pathIsIdsfind =
    pathname.endsWith('/idsfind') || pathname.endsWith('/idsfind-spa')
  const searchParams = useSearchParams()
  const initialIds = pathIsIdsfind ? searchParams.getAll('ids') : []
  const initialWhole = pathIsIdsfind ? searchParams.get('whole') ?? '' : ''
  const initialQuery = pathIsIdsfind ? searchParams.get('query') ?? '' : ''
  const [ids, setIds] = useState<string[]>(initialIds)
  const [whole, setWhole] = useState<string>(initialWhole)
  const [query, setQuery] = useState<string>(initialQuery)
  const [showHelp, setShowHelp] = useState(false)
  return (
    <div className="w-full">
      <GetForm action={action}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              <h2>IDS Finder</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border bg-muted/40 p-3">
              <p className="mb-2 text-sm text-muted-foreground">Quick examples</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIds(['⿰日月'])}>
                  IDS: ⿰日月
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setWhole('＠⿰？月')}>
                  Whole: ＠⿰？月
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setQuery('：日')}>
                  Query: ：日
                </Button>
              </div>
            </div>
            <div className="mt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp((v) => !v)}
              >
                {showHelp
                  ? 'Hide operators'
                  : getText('list-of-ids-operators.summary', lang)}
              </Button>
              {showHelp && (
                <div className="mt-2 rounded-md border border-border p-3">
                  <dl>
                    <dt>{getText('ids-unary-operators.dt', lang)}</dt>
                    <dd>〾↔↷</dd>
                    <dt>{getText('ids-binary-operators.dt', lang)}</dt>
                    <dd>⿰⿱⿴⿵⿶⿷⿸⿹⿺⿻</dd>
                    <dt>{getText('ids-ternary-operators.dt', lang)}</dt>
                    <dd>⿲⿳</dd>
                  </dl>
                </div>
              )}
            </div>
            <div key="ids" className="mt-2">
              <label className="mb-1 inline-block font-semibold">
                {getText('ids-multiple-sequences-can-be-entered.label', lang)}
              </label>
              <MultiInput
                name="ids"
                values={ids}
                placeholder={(i) => `IDS #${i + 1}`}
                setValues={setIds}
              />
            </div>
            <div key="whole" className="mt-2">
              <label htmlFor="ids-finder-whole-input" className="mb-1 inline-block font-semibold">
                {getText('whole-ids.label', lang)}
              </label>
              <Input
                id="ids-finder-whole-input"
                name={whole ? 'whole' : undefined}
                value={whole}
                placeholder={getText('whole-ids.placeholder', lang)}
                onChange={(e) => setWhole(e.target.value)}
              />
            </div>
            <div key="query" className="mt-2">
              <label htmlFor="ids-finder-query-input" className="mb-1 inline-block font-semibold">
                {getText('other-search-queries.label', lang)}
              </label>
              <Input
                id="ids-finder-query-input"
                name={query ? 'query' : undefined}
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
