import type { ReactNode } from 'react'
import type { Language } from '@/getText'
import IdsFinder from '@/components/IdsFinder'
import MobileFormDrawer from '@/components/MobileFormDrawer'

export interface IdsfindPageShellProps {
  language: Language
  hasQuery: boolean
  formAction: string
  formNavLabel?: string
  mobileResultsFormMode?: 'inline' | 'drawer'
  prelude?: ReactNode
  results?: ReactNode
}

export default function IdsfindPageShell(props: IdsfindPageShellProps) {
  const {
    language,
    hasQuery,
    formAction,
    formNavLabel,
    mobileResultsFormMode = 'inline',
    prelude,
    results,
  } = props

  const form = <IdsFinder lang={language} action={formAction} />

  if (!hasQuery) {
    return (
      <section>
        {prelude}
        {form}
      </section>
    )
  }

  return (
    <div className="responsive-search-shell">
      {prelude}
      {mobileResultsFormMode === 'drawer' && formNavLabel ? (
        <>
          <section className="responsive-mobile-only">
            <MobileFormDrawer buttonLabel={formNavLabel} title={formNavLabel}>
              {form}
            </MobileFormDrawer>
          </section>
          <section className="responsive-desktop-sticky responsive-desktop-only">
            {form}
          </section>
        </>
      ) : (
        <section className="responsive-desktop-sticky">{form}</section>
      )}
      {results ? <section className="responsive-results-pane">{results}</section> : null}
    </div>
  )
}
