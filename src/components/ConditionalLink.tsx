'use client'

import Link from 'next/link'
import { ReactNode, ReactElement } from 'react'

export interface ConditionalLinkProps {
  href: string | undefined
  prefetch?: boolean
  children: ReactNode | ReactNode[]
  disableExternalLinks?: boolean
}

export default function ConditionalLink(
  props: ConditionalLinkProps,
): ReactElement {
  const { href, prefetch, children, disableExternalLinks } = props
  if (href) {
    if (href.startsWith('http://') || href.startsWith('https://')) {
      if (disableExternalLinks) {
        return <span>{children}</span>
      }
      // FIXME: Next.js bug? Navigation history is not recorded correctly when using Link.
      return <a href={href}>{children}</a>
    }
    return (
      <Link prefetch={prefetch} href={href}>
        {children}
      </Link>
    )
  } else {
    return <span>{children}</span>
  }
}
