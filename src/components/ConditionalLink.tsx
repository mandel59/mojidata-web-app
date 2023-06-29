import Link from "next/link"
import { ReactNode, ReactElement } from "react"

export interface ConditionalLinkProps {
  href: string | undefined
  prefetch?: boolean
  children: ReactNode | ReactNode[]
}

export default function ConditionalLink(props: ConditionalLinkProps): ReactElement {
  const { href, prefetch, children } = props
  if (href) {
    // FIXME: Next.js bug? Navigation history is not recorded correctly when using Link.
    return <Link prefetch={prefetch} href={href}>{children}</Link>
  } else {
    return <span>{children}</span>
  }
}
