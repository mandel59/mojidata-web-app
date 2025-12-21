import { getText, Language } from '@/getText'
import Link from 'next/link'

export interface SiteHeaderProps {
  siteName: string
  language: Language
}

export function SiteHeader(props: SiteHeaderProps) {
  const { siteName, language } = props
  return (
    <header className="container">
      <h1>{siteName}</h1>
      <nav>
        <ul>
          <li>
            <Link href="/idsfind">{getText('ids-finder.nav', language)}</Link>
          </li>
          <li>
            <Link href="/search">{getText('mojidata-search.nav', language)}</Link>
          </li>
        </ul>
        <ul>
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
