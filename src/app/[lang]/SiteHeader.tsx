import { getText, Language } from '@/getText'
import Link from 'next/link'

export interface SiteHeaderProps {
  siteName: string
  language: Language
}

export function SiteHeader(props: SiteHeaderProps) {
  const { siteName, language } = props

  return (
    <header className="rounded-md border border-border/70 bg-background/80 px-3 py-2">
      <div className="flex flex-col gap-1.5 text-sm md:flex-row md:items-center md:gap-4">
        <Link className="whitespace-nowrap font-semibold text-foreground no-underline" href="/search">
          {siteName}
        </Link>

        <nav aria-label="Global" className="min-w-0">
          <ul className="m-0 flex flex-wrap gap-x-3 gap-y-1 p-0 text-muted-foreground">
            <li>
              <Link className="whitespace-nowrap hover:text-foreground" href="/search">
                {getText('mojidata-search.nav', language)}
              </Link>
            </li>
            <li>
              <Link className="whitespace-nowrap hover:text-foreground" href="/idsfind">
                {getText('ids-finder.nav', language)}
              </Link>
            </li>
          </ul>
          <ul className="m-0 mt-0.5 flex flex-wrap gap-x-3 gap-y-1 p-0 text-xs text-muted-foreground/90">
            <li>
              <Link className="whitespace-nowrap hover:text-foreground" href="/about">
                {getText('about-this-app.nav', language)}
              </Link>
            </li>
            <li>
              <Link className="whitespace-nowrap hover:text-foreground" href="/license">
                {getText('license.nav', language)}
              </Link>
            </li>
            <li>
              <Link className="whitespace-nowrap hover:text-foreground" href="/privacy-policy">
                {getText('privacy-policy.nav', language)}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
