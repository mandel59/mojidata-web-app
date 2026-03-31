'use client'

import { getCanonicalRoutePath } from '@/deliveryPolicy'
import { getText, Language } from '@/getText'
import Link from 'next/link'

export interface SiteHeaderProps {
  siteName: string
  language: Language
}

export function SiteHeader(props: SiteHeaderProps) {
  const { siteName, language } = props
  const searchPath = getCanonicalRoutePath('search')
  const idsfindPath = getCanonicalRoutePath('idsfind')

  return (
    <header className="rounded-md border border-border/70 bg-background/80 px-3 py-2">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <Link
            className="hidden shrink-0 whitespace-nowrap font-semibold text-foreground no-underline md:inline"
            href={searchPath}
          >
            {siteName}
          </Link>

          <nav
            aria-label="Primary"
            className="flex min-w-0 items-center gap-1 overflow-x-auto whitespace-nowrap text-[13px] sm:text-sm"
          >
            <Link
              className="inline-flex h-9 items-center rounded px-2 leading-none text-muted-foreground hover:bg-muted hover:text-foreground"
              href={searchPath}
            >
              {getText('mojidata-search.nav', language)}
            </Link>
            <Link
              className="inline-flex h-9 items-center rounded px-2 leading-none text-muted-foreground hover:bg-muted hover:text-foreground"
              href={idsfindPath}
            >
              {getText('ids-finder.nav', language)}
            </Link>
          </nav>
        </div>

        <details className="relative flex h-9 items-center">
          <summary className="m-0 inline-flex h-9 cursor-pointer list-none items-center justify-center rounded-md px-2 text-sm font-medium leading-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            More
          </summary>
          <div
            role="menu"
            aria-label="Secondary navigation"
            className="absolute right-0 top-[calc(100%+0.25rem)] z-30 min-w-44 rounded-md border border-border bg-card p-1 text-sm shadow-lg"
          >
            <Link
              role="menuitem"
              className="block rounded px-2 py-1.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href="/about"
            >
              {getText('about-this-app.nav', language)}
            </Link>
            <div
              className="block rounded px-2 py-1.5"
              aria-hidden="true"
            >
            </div>
            <Link
              role="menuitem"
              className="block rounded px-2 py-1.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href="/license"
            >
              {getText('license.nav', language)}
            </Link>
            <Link
              role="menuitem"
              className="block rounded px-2 py-1.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href="/privacy-policy"
            >
              {getText('privacy-policy.nav', language)}
            </Link>
          </div>
        </details>
      </div>
    </header>
  )
}
