'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

export interface NavigationPendingIndicatorProps {
  label: string
}

const SKIP_ATTRIBUTE = 'data-skip-navigation-pending'

function isUnmodifiedPrimaryClick(event: MouseEvent) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  )
}

export default function NavigationPendingIndicator(
  props: NavigationPendingIndicatorProps,
) {
  const { label } = props
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const routeKey = useMemo(
    () => `${pathname}?${searchParams.toString()}`,
    [pathname, searchParams],
  )
  const [pending, setPending] = useState(false)
  const resetTimer = useRef<number | null>(null)
  const previousRouteKey = useRef(routeKey)
  const pendingStartedAt = useRef<number | null>(null)

  useEffect(() => {
    if (previousRouteKey.current === routeKey) return
    previousRouteKey.current = routeKey
    if (!pending) return
    const elapsed =
      pendingStartedAt.current == null
        ? 0
        : Date.now() - pendingStartedAt.current
    const remaining = Math.max(0, 400 - elapsed)
    const timer = window.setTimeout(() => {
      setPending(false)
    }, remaining)
    return () => {
      window.clearTimeout(timer)
    }
  }, [pending, routeKey])

  useEffect(() => {
    const clearPendingLater = () => {
      if (resetTimer.current != null) {
        window.clearTimeout(resetTimer.current)
      }
      resetTimer.current = window.setTimeout(() => {
        setPending(false)
        resetTimer.current = null
      }, 15000)
    }

    const handleClick = (event: MouseEvent) => {
      if (!isUnmodifiedPrimaryClick(event)) return
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return
      if (anchor.getAttribute(SKIP_ATTRIBUTE) === 'true') return
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash === window.location.hash
      ) {
        return
      }
      pendingStartedAt.current = Date.now()
      setPending(true)
      clearPendingLater()
    }

    document.addEventListener('click', handleClick, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
      if (resetTimer.current != null) {
        window.clearTimeout(resetTimer.current)
        resetTimer.current = null
      }
    }
  }, [])

  return (
    <div
      className="navigation-progress"
      data-navigation-pending={pending ? 'true' : 'false'}
      aria-hidden={!pending}
    >
      <div className="navigation-progress__bar" />
      <span className="sr-only" aria-live="polite">
        {pending ? label : ''}
      </span>
    </div>
  )
}
