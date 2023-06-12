'use client'

import Link from 'next/link'
import { ReactElement, useEffect, useState } from 'react'

export default function PreviewWarning(): ReactElement {
  const [hostname, setHostname] = useState<string | undefined>(undefined)
  const [productionPage, setProductionPage] = useState<string | undefined>(
    undefined,
  )
  useEffect(() => {
    setHostname(window.location.hostname)
    const productionUrl = new URL(window.location.href)
    productionUrl.protocol = 'https'
    productionUrl.hostname = 'mojidata.ryusei.dev'
    productionUrl.port = ''
    setProductionPage(productionUrl.href)
  }, [])
  switch (hostname) {
    case undefined:
    case 'mojidata.ryusei.dev':
      return <></>
    default:
      return (
        <div className="preview-warning">
          <p>
            This is a preview of the site. The production site is at &lt;
            <Link  href="https://mojidata.ryusei.dev/">
              https://mojidata.ryusei.dev/
            </Link >
            &gt;.{' '}
            {productionPage && (
              <Link  href={productionPage}>
                Go to the production version of this page
              </Link >
            )}
          </p>
        </div>
      )
  }
}
