'use client'

import { useState } from 'react'
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

  return (
    <header className="rounded-md border border-border/70 bg-background/80 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link className="shrink-0 whitespace-nowrap font-semibold text-foreground no-underline" href="/search">
            {siteName}
          </Link>
          <nav aria-label="Primary" className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
            <Link className="rounded px-2 py-1 whitespace-nowrap hover:bg-muted hover:text-foreground" href="/search">
              {getText('mojidata-search.nav', language)}
            </Link>
            <Link className="rounded px-2 py-1 whitespace-nowrap hover:bg-muted hover:text-foreground" href="/idsfind">
              {getText('ids-finder.nav', language)}
            </Link>
          </nav>
        </div>

        <div className="relative shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((v) => !v)}
          >
            …
          </Button>
          {moreOpen && (
            <div className="absolute right-0 top-10 z-30 min-w-44 rounded-md border border-border bg-card p-1 text-sm shadow-lg">
              <Link
                className="block rounded px-2 py-1.5 hover:bg-muted"
                href="/about"
                onClick={() => setMoreOpen(false)}
              >
                {getText('about-this-app.nav', language)}
              </Link>
              <Link
                className="block rounded px-2 py-1.5 hover:bg-muted"
                href="/license"
                onClick={() => setMoreOpen(false)}
              >
                {getText('license.nav', language)}
              </Link>
              <Link
                className="block rounded px-2 py-1.5 hover:bg-muted"
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
