import type { ReactNode } from 'react'
import type { Language } from '@/getText'
import IdsFinder from '@/components/IdsFinder'
import MobileFormDrawer from '@/components/MobileFormDrawer'
import styles from '@/features/formResultsShell.module.css'

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
