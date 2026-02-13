import { getText, Language } from '@/getText'
import Link from 'next/link'

export interface SiteHeaderProps {
  siteName: string
  language: Language
}

export function SiteHeader(props: SiteHeaderProps) {
  const { siteName, language } = props
  return (
    <header className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <h1 className="mb-3 text-2xl font-semibold leading-tight">
        <Link className="text-inherit no-underline" href="/search">
          {siteName}
        </Link>
      </h1>
      <nav aria-label="Global" className="space-y-1">
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
