'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type MouseEvent, type ReactNode, useState } from 'react'

export interface IntentPrefetchLinkProps {
  href: string | undefined
  children: ReactNode
  className?: string
  disableExternalLinks?: boolean
  prefetchOnIntent?: boolean
}

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}

export default function IntentPrefetchLink(props: IntentPrefetchLinkProps) {
  const {
    href,
    children,
    className,
    disableExternalLinks,
    prefetchOnIntent,
  } = props
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [prefetched, setPrefetched] = useState(false)

  if (!href) {
    return <span>{children}</span>
  }

  const isExternal =
    href.startsWith('http://') || href.startsWith('https://')

  if (isExternal) {
    if (disableExternalLinks) {
      return <span>{children}</span>
    }
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }

  const prefetch = () => {
    if (!prefetchOnIntent || prefetched) return
    setPrefetched(true)
    void router.prefetch(href)
  }

  return (
    <Link
      href={href}
      prefetch={false}
      className={className}
      data-pending={pending ? 'true' : 'false'}
      aria-busy={pending || undefined}
      onPointerEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
      onClick={(event) => {
        if (event.button !== 0 || isModifiedClick(event)) return
        setPending(true)
      }}
    >
      {children}
    </Link>
  )
}
