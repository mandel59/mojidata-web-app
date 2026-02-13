'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { getText, Language } from '@/getText'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export interface SiteHeaderProps {
  siteName: string
  language: Language
}

export function SiteHeader(props: SiteHeaderProps) {
  const { siteName, language } = props
  const [moreOpen, setMoreOpen] = useState(false)
  const menuId = useId()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!moreOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false)
    }
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [moreOpen])

  return (
    <header className="rounded-md border border-border/70 bg-background/80 px-3 py-2">
      <div className="flex min-h-8 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <Link
            className="hidden shrink-0 whitespace-nowrap font-semibold text-foreground no-underline md:inline"
            href="/search"
          >
            {siteName}
          </Link>

          <nav aria-label="Primary" className="flex items-center gap-1 text-[13px] sm:text-sm">
            <Link
              className="inline-flex h-8 items-center rounded px-2 leading-none text-muted-foreground hover:bg-muted hover:text-foreground"
              href="/search"
            >
              {getText('mojidata-search.nav', language)}
            </Link>
            <Link
              className="inline-flex h-8 items-center rounded px-2 leading-none text-muted-foreground hover:bg-muted hover:text-foreground"
              href="/idsfind"
            >
              {getText('ids-finder.nav', language)}
            </Link>
          </nav>
        </div>

        <div className="relative shrink-0" ref={menuRef}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 leading-none"
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            aria-controls={menuId}
            aria-label="Open secondary menu"
            onClick={() => setMoreOpen((v) => !v)}
          >
            More
          </Button>
          {moreOpen && (
            <div
              id={menuId}
              role="menu"
              aria-label="Secondary navigation"
              className="absolute right-0 top-[calc(100%+0.25rem)] z-30 min-w-44 rounded-md border border-border bg-card p-1 text-sm shadow-lg"
            >
              <Link
                role="menuitem"
                className="block rounded px-2 py-1.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href="/about"
                onClick={() => setMoreOpen(false)}
              >
                {getText('about-this-app.nav', language)}
              </Link>
              <Link
                role="menuitem"
                className="block rounded px-2 py-1.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href="/license"
                onClick={() => setMoreOpen(false)}
              >
                {getText('license.nav', language)}
              </Link>
              <Link
                role="menuitem"
                className="block rounded px-2 py-1.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href="/privacy-policy"
                onClick={() => setMoreOpen(false)}
              >
                {getText('privacy-policy.nav', language)}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
