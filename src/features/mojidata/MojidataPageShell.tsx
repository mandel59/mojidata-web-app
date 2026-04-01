import type { ReactNode } from 'react'
import styles from './MojidataPageShell.module.css'

export interface MojidataPageShellProps {
  spaMarker?: boolean
  requireJavaScript?: boolean
  prelude?: ReactNode
  children: ReactNode
}

export default function MojidataPageShell(props: MojidataPageShellProps) {
  const {
    spaMarker = false,
    requireJavaScript = false,
    prelude,
    children,
  } = props

  const content = spaMarker ? (
    <div data-spa="mojidata">
      {requireJavaScript ? (
        <noscript>
          <p>This page requires JavaScript.</p>
        </noscript>
      ) : null}
      {children}
    </div>
  ) : (
    children
  )

  return (
    <div className={styles.main}>
      {prelude}
      {content}
    </div>
  )
}
