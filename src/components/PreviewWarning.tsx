'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

export default function PreviewWarning(): ReactElement {
  const location = window.location
  switch (location.hostname) {
    case 'localhost':
    case 'mojidata-web-app.vercel.app':
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
    default:
      return <></>
  }
}
