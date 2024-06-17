'use client'

import MultiInput from './MultiInput'
import GetForm from './GetForm'
import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import './IdsFinder.css'

export default function IdsFinder() {
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
            <summary>IDS Operators</summary>
            <dl>
              <dt>IDS Unary Operators</dt>
              <dd>〾↔↷</dd>
              <dt>IDS Binary Operators</dt>
              <dd>⿰⿱⿴⿵⿶⿷⿸⿹⿺⿻</dd>
              <dt>IDS Ternary Operators</dt>
              <dd>⿲⿳</dd>
            </dl>
          </details>
          <div key="ids">
            IDS (Multiple sequences can be entered):{' '}
            <MultiInput
              name="ids"
              values={ids}
              placeholder={(i) => `IDS #${i + 1}`}
              setValues={setIds}
            />
          </div>
          <div key="whole">
            Whole IDS:{' '}
            <input
              name={whole ? 'whole' : undefined}
              value={whole}
              placeholder="Whole IDS"
              onChange={(e) => setWhole(e.target.value)}
            />
          </div>
          <div key="query">
            Other search queries:{' '}
            <input
              name={query ? 'query' : undefined}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <footer>
            <button>Search</button>
          </footer>
        </article>
      </GetForm>
    </div>
  )
}
