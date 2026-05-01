import {
  type AnchorHTMLAttributes,
  type MouseEvent,
  forwardRef,
} from 'react'
import { navigate } from './next-navigation'

type LinkHref = string | URL | { pathname?: string; query?: URLSearchParams }

export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: LinkHref
  prefetch?: boolean
  replace?: boolean
  scroll?: boolean
}

function hrefToString(href: LinkHref) {
  if (typeof href === 'string') return href
  if (href instanceof URL) return href.href
  const pathname = href.pathname ?? '/'
  const query = href.query?.toString()
  return query ? `${pathname}?${query}` : pathname
}

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  const {
    href,
    onClick,
    prefetch: _prefetch,
    replace,
    scroll,
    target,
    ...rest
  } = props
  const hrefString = hrefToString(href)

  return (
    <a
      {...rest}
      ref={ref}
      href={hrefString}
      target={target}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        if (event.button !== 0 || isModifiedClick(event)) return
        if (target && target !== '_self') return

        const url = new URL(hrefString, window.location.href)
        if (url.origin !== window.location.origin) return

        event.preventDefault()
        navigate(url.href, { replace, scroll })
      }}
    />
  )
})

export default Link
