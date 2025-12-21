'use client'

import Link from 'next/link'
import { ReactElement, useMemo, useSyncExternalStore } from 'react'

export default function PreviewWarning(): ReactElement {
  const href = useSyncExternalStore(
    () => () => {},
    () => window.location.href,
    () => 'https://mojidata.ryusei.dev/',
  )
  const { hostname, productionPage } = useMemo(() => {
    const currentUrl = new URL(href)
    const productionUrl = new URL(href)
    productionUrl.protocol = 'https'
    productionUrl.hostname = 'mojidata.ryusei.dev'
    productionUrl.port = ''
    return { hostname: currentUrl.hostname, productionPage: productionUrl.href }
  }, [href])
  switch (hostname) {
    case 'mojidata.ryusei.dev':
      return <></>
    default:
      return (
        <div className="container">
          <article>
            <p>
              This is a preview of the site. The production site is at &lt;
              <Link href="https://mojidata.ryusei.dev/">
                https://mojidata.ryusei.dev/
              </Link>
              &gt;
              <br />
              {productionPage && (
                <Link href={productionPage}>
                  Go to the production version of this page
                </Link>
              )}
            </p>
          </article>
        </div>
      )
  }
}
