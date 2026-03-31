'use client'

import Link from 'next/link'
import { ReactElement, useMemo, useSyncExternalStore } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'

const DISMISS_EVENT = 'preview-warning-dismiss'

function subscribeToDismissState(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const onChange = () => callback()
  window.addEventListener('storage', onChange)
  window.addEventListener(DISMISS_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(DISMISS_EVENT, onChange)
  }
}

function getDismissKey(hostname: string) {
  return `preview-warning-dismissed:${hostname}`
}

function isDismissed(hostname: string) {
  if (typeof window === 'undefined' || !hostname) return false
  return window.localStorage.getItem(getDismissKey(hostname)) === '1'
}

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
  const dismissed = useSyncExternalStore(
    subscribeToDismissState,
    () => isDismissed(hostname),
    () => false,
  )

  if (hostname === 'mojidata.ryusei.dev' || dismissed) {
    return <></>
  }

  const dismiss = () => {
    window.localStorage.setItem(getDismissKey(hostname), '1')
    window.dispatchEvent(new Event(DISMISS_EVENT))
  }
  return (
    <div className="preview-warning-toast" role="status" aria-live="polite">
      <Card>
        <CardContent className="preview-warning-content">
          <div className="preview-warning-actions">
            <p>
              This is a preview of the site. The production site is at &lt;
              <Link href="https://mojidata.ryusei.dev/">
                https://mojidata.ryusei.dev/
              </Link>
              &gt;
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={dismiss}>
              Dismiss
            </Button>
          </div>
          {productionPage && (
            <Link
              href={productionPage}
              className={buttonVariants({ variant: 'link', size: 'sm' })}
            >
              Open this page on production
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
