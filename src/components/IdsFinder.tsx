'use client'

import MultiInput from './MultiInput'
import GetForm from './GetForm'
import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Language, getText } from '@/getText'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { getCanonicalRoutePath } from '@/deliveryPolicy'
import Link from 'next/link'

export interface IdsFinderProps {
  lang: Language
  action?: string
}
export default function IdsFinder(props: IdsFinderProps) {
  const { lang, action = getCanonicalRoutePath('idsfind') } = props
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initialIds = searchParams.getAll('ids')
  const initialWhole = searchParams.get('whole') ?? ''
  const initialQuery = searchParams.get('query') ?? ''
  const [ids, setIds] = useState<string[]>(initialIds)
  const [whole, setWhole] = useState<string>(initialWhole)
  const [query, setQuery] = useState<string>(initialQuery)
  const [showHelp, setShowHelp] = useState(false)
  const buildExampleHref = (paramsUpdater: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('ids')
    params.delete('whole')
    params.delete('query')
    params.delete('page')
    paramsUpdater(params)
    const query = params.toString()
    return query ? `${pathname ?? action}?${query}` : pathname ?? action
  }
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
                <Link
                  href={buildExampleHref((params) => params.append('ids', '⿰日月'))}
                  data-skip-navigation-pending="true"
                  className={buttonVariants({ size: 'sm' })}
                  onClick={(event) => {
                    event.preventDefault()
                    setIds(['⿰日月'])
                    setWhole('')
                    setQuery('')
                  }}
                >
                  IDS: ⿰日月
                </Link>
                <Link
                  href={buildExampleHref((params) => params.set('whole', '⿰？月'))}
                  data-skip-navigation-pending="true"
                  className={buttonVariants({ size: 'sm' })}
                  onClick={(event) => {
                    event.preventDefault()
                    setIds([])
                    setWhole('⿰？月')
                    setQuery('')
                  }}
                >
                  Whole: ⿰？月
                </Link>
                <Link
                  href={buildExampleHref((params) => params.set('query', '：日'))}
                  data-skip-navigation-pending="true"
                  className={buttonVariants({ size: 'sm' })}
                  onClick={(event) => {
                    event.preventDefault()
                    setIds([])
                    setWhole('')
                    setQuery('：日')
                  }}
                >
                  Query: ：日
                </Link>
              </div>
            </div>
            <div className="mt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(true)}
              >
                {getText('list-of-ids-operators.summary', lang)}
              </Button>
            </div>
            <Modal
              open={showHelp}
              onClose={() => setShowHelp(false)}
              title={getText('list-of-ids-operators.summary', lang)}
            >
              <dl>
                <dt>{getText('ids-unary-operators.dt', lang)}</dt>
                <dd>〾↔↷</dd>
                <dt>{getText('ids-binary-operators.dt', lang)}</dt>
                <dd>⿰⿱⿴⿵⿶⿷⿸⿹⿺⿻</dd>
                <dt>{getText('ids-ternary-operators.dt', lang)}</dt>
                <dd>⿲⿳</dd>
              </dl>
            </Modal>
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
                name="whole"
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
