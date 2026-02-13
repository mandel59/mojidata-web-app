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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <Link className="font-semibold text-foreground no-underline" href="/search">
          {siteName}
        </Link>

        <nav aria-label="Global" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
          <Link className="hover:text-foreground" href="/search">
            {getText('mojidata-search.nav', language)}
          </Link>
          <Link className="hover:text-foreground" href="/idsfind">
            {getText('ids-finder.nav', language)}
          </Link>
          <span className="text-border">•</span>
          <Link className="hover:text-foreground" href="/about">
            {getText('about-this-app.nav', language)}
          </Link>
          <Link className="hover:text-foreground" href="/license">
            {getText('license.nav', language)}
          </Link>
          <Link className="hover:text-foreground" href="/privacy-policy">
            {getText('privacy-policy.nav', language)}
          </Link>
        </nav>
      </div>
    </header>
  )
}
