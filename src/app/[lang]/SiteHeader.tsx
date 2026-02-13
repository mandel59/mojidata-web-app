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
  const [open, setOpen] = useState(false)

  return (
    <header className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h1 className="m-0 text-2xl font-semibold leading-tight">
          <Link className="text-inherit no-underline" href="/search">
            {siteName}
          </Link>
        </h1>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="lg:hidden"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </Button>
      </div>
      <nav aria-label="Global" className={`${open ? 'block' : 'hidden'} space-y-1 lg:block`}>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Explore
        </div>
        <ul className="m-0 list-none space-y-1 p-0">
          <li>
            <Link
              className="block rounded-md px-2.5 py-2 font-medium transition-colors hover:bg-muted"
              href="/search"
            >
              {getText('mojidata-search.nav', language)}
            </Link>
          </li>
          <li>
            <Link
              className="block rounded-md px-2.5 py-2 font-medium transition-colors hover:bg-muted"
              href="/idsfind"
            >
              {getText('ids-finder.nav', language)}
            </Link>
          </li>
        </ul>
        <div className="pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Info
        </div>
        <ul className="m-0 list-none space-y-1 p-0">
          <li>
            <Link
              className="block rounded-md px-2.5 py-2 text-sm opacity-90 transition-colors hover:bg-muted"
              href="/about"
            >
              {getText('about-this-app.nav', language)}
            </Link>
          </li>
          <li>
            <Link
              className="block rounded-md px-2.5 py-2 text-sm opacity-90 transition-colors hover:bg-muted"
              href="/license"
            >
              {getText('license.nav', language)}
            </Link>
          </li>
          <li>
            <Link
              className="block rounded-md px-2.5 py-2 text-sm opacity-90 transition-colors hover:bg-muted"
              href="/privacy-policy"
            >
              {getText('privacy-policy.nav', language)}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
