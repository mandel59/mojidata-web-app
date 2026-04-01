import type { ReactNode } from 'react'
import type { Language } from '@/getText'
import MojidataSearchForm from '@/components/MojidataSearchForm'
import MobileFormDrawer from '@/components/MobileFormDrawer'
import styles from '@/features/formResultsShell.module.css'

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
    <div className={styles.shell}>
      {prelude}
      {mobileResultsFormMode === 'drawer' && formNavLabel ? (
        <>
          <section className={styles.mobileOnly}>
            <MobileFormDrawer buttonLabel={formNavLabel} title={formNavLabel}>
              {form}
            </MobileFormDrawer>
          </section>
          <section className={`${styles.desktopSticky} ${styles.desktopOnly}`}>
            {form}
          </section>
        </>
      ) : (
        <section className={styles.desktopSticky}>{form}</section>
      )}
      {results ? <section className={styles.resultsPane}>{results}</section> : null}
    </div>
  )
}
