'use client'

import MultiInput from './MultiInput'
import GetForm from './GetForm'
import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import './IdsFinder.css'
import { Language, getText } from '@/getText'

export interface IdsFinderProps {
  lang: Language
}
export default function IdsFinder(props: IdsFinderProps) {
  const { lang } = props
  const pathname = usePathname()
  const pathIsIdsfind = pathname === '/idsfind'
  const searchParams = useSearchParams()
  const initialIds = pathIsIdsfind ? searchParams.getAll('ids') : []
  const initialWhole = pathIsIdsfind ? searchParams.get('whole') ?? '' : ''
  const initialQuery = pathIsIdsfind ? searchParams.get('query') ?? '' : ''
  const [ids, setIds] = useState<string[]>(initialIds)
  const [whole, setWhole] = useState<string>(initialWhole)
  const [query, setQuery] = useState<string>(initialQuery)
  return (
    <div className="ids-finder">
      <GetForm action="/idsfind">
        <article>
          <h2>IDS Finder</h2>
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
          <div key="ids">
            {getText('ids-multiple-sequences-can-be-entered.label', lang)}{' '}
            <MultiInput
              name="ids"
              values={ids}
              placeholder={(i) => `IDS #${i + 1}`}
              setValues={setIds}
            />
          </div>
          <div key="whole">
            {getText('whole-ids.label', lang)}{' '}
            <input
              name={whole ? 'whole' : undefined}
              value={whole}
              placeholder={getText('whole-ids.placeholder', lang)}
              onChange={(e) => setWhole(e.target.value)}
            />
          </div>
          <div key="query">
            {getText('other-search-queries.label', lang)}{' '}
            <input
              name={query ? 'query' : undefined}
              value={query}
              placeholder={getText('mojidata-search.placeholder', lang)}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <footer>
            <button>{getText('search.button', lang)}</button>
          </footer>
        </article>
      </GetForm>
    </div>
  )
}
