'use client'

import MultiInput from './MultiInput'
import GetForm from './GetForm'
import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function IdsFinder() {
  const pathname = usePathname()
  const pathIsIdsfind = pathname === '/idsfind'
  const searchParams = useSearchParams()
  const initialIds = pathIsIdsfind ? searchParams.getAll('ids') : []
  const initialWhole = pathIsIdsfind ? searchParams.get('whole') ?? '' : ''
  const [ids, setIds] = useState<string[]>(initialIds)
  const [whole, setWhole] = useState<string>(initialWhole)
  return (
    <div className="ids-finder">
      <h2>IDS Finder</h2>
      <p>Find CJKV characters with the given IDS.</p>
      <dl>
        <dt>IDS Unary Operators</dt>
        <dd>〾↔↷</dd>
        <dt>IDS Binary Operators</dt>
        <dd>⿰⿱⿴⿵⿶⿷⿸⿹⿺⿻</dd>
        <dt>IDS Ternary Operators</dt>
        <dd>⿲⿳</dd>
      </dl>
      <GetForm action="/idsfind">
        <div key="ids">
          IDS:
          <MultiInput name="ids" values={ids} setValues={setIds} />
        </div>
        <div key="whole">
          Whole IDS:
          <input
            name={whole === '' ? undefined : 'whole'}
            value={whole}
            onChange={(e) => setWhole(e.target.value)}
          />
        </div>
        <button disabled={ids.every((x) => x === '') && whole === ''}>
          Search
        </button>
      </GetForm>
    </div>
  )
}
