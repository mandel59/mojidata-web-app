'use client'

import MultiInput from './MultiInput'
import GetForm from './GetForm'
import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import './IdsFinder.css'
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
  return (
    <div className="ids-finder">
      <GetForm action={action}>
        <Card className="ids-finder-card">
          <CardHeader>
            <CardTitle>
              <h2>IDS Finder</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <details>
              <summary>{getText('list-of-ids-operators.summary', lang)}</summary>
              <dl>
                <dt>{getText('ids-unary-operators.dt', lang)}</dt>
                <dd>〾↔↷</dd>
                <dt>{getText('ids-binary-operators.dt', lang)}</dt>
                <dd>⿰⿱⿴⿵⿶⿷⿸⿹⿺⿻</dd>
                <dt>{getText('ids-ternary-operators.dt', lang)}</dt>
                <dd>⿲⿳</dd>
              </dl>
            </details>
            <div key="ids" className="ids-finder-field-row">
              <label>{getText('ids-multiple-sequences-can-be-entered.label', lang)}</label>
              <MultiInput
                name="ids"
                values={ids}
                placeholder={(i) => `IDS #${i + 1}`}
                setValues={setIds}
              />
            </div>
            <div key="whole" className="ids-finder-field-row">
              <label htmlFor="ids-finder-whole-input">
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
            <div key="query" className="ids-finder-field-row">
              <label htmlFor="ids-finder-query-input">
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
            <footer className="ids-finder-footer">
              <Button type="submit">{getText('search.button', lang)}</Button>
            </footer>
          </CardContent>
        </Card>
      </GetForm>
    </div>
  )
}
