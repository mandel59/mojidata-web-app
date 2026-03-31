import type { ReactNode } from 'react'

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
    <div>
      <main className="container mojidata-page-main">
        {prelude}
        {content}
      </main>
    </div>
  )
}
