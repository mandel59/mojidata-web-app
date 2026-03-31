import type { ReactNode } from 'react'
import type { Language } from '@/getText'
import MojidataSearchForm from '@/components/MojidataSearchForm'
import MobileFormDrawer from '@/components/MobileFormDrawer'

export interface SearchPageShellProps {
  language: Language
  query: string
  formAction: string
  formNavLabel?: string
  mobileResultsFormMode?: 'inline' | 'drawer'
  prelude?: ReactNode
  results?: ReactNode
}

export default function SearchPageShell(props: SearchPageShellProps) {
  const {
    language,
    query,
    formAction,
    formNavLabel,
    mobileResultsFormMode = 'inline',
    prelude,
    results,
  } = props

  const form = <MojidataSearchForm lang={language} action={formAction} />

  if (!query) {
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
