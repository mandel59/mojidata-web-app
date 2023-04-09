'use client'

import MultiInput from './MultiInput'
import GetForm from './GetForm'
import useSessionStorage from '@/hooks/useSessionStorage'

export default function IdsFinder() {
  const [ids, setIds] = useSessionStorage<string[]>('idsfinder-ids', [])
  const [whole, setWhole] = useSessionStorage<string>('idsfinder-whole', '')
  return (
    <div className="ids-finder">
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
