'use client'

import Link from 'next/link'
import { ReactElement, useEffect, useState } from 'react'

export default function PreviewWarning(): ReactElement {
  const [hostname, setHostname] = useState<string | undefined>(undefined)
  useEffect(() => {
    setHostname(window.location.hostname)
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
            <Link href="https://mojidata.ryusei.dev/">
              https://mojidata.ryusei.dev/
            </Link>
            &gt;.
          </p>
        </div>
      )
  }
}
