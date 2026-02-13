import { getText, Language } from '@/getText'
import Link from 'next/link'

export interface SiteHeaderProps {
  siteName: string
  language: Language
}

export function SiteHeader(props: SiteHeaderProps) {
  const { siteName, language } = props
  return (
    <header className="container site-header mx-auto">
      <div className="site-header-title-row">
        <h1 className="site-title">
          <Link href="/search">{siteName}</Link>
        </h1>
      </div>
      <nav className="site-nav" aria-label="Global">
        <ul className="site-nav-primary">
          <li>
            <Link href="/idsfind">{getText('ids-finder.nav', language)}</Link>
          </li>
          <li>
            <Link href="/search">{getText('mojidata-search.nav', language)}</Link>
          </li>
        </ul>
        <ul className="site-nav-secondary">
          <li>
            <Link href="/privacy-policy">
              {getText('privacy-policy.nav', language)}
            </Link>
          </li>
          <li>
            <Link href="/about">{getText('about-this-app.nav', language)}</Link>
          </li>
          <li>
            <Link href="/license">{getText('license.nav', language)}</Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
