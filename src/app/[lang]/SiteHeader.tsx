import { getText, Language } from '@/getText'

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
            <a href="/idsfind">{getText('ids-finder.nav', language)}</a>
          </li>
          <li>
            <a href="/search">{getText('mojidata-search.nav', language)}</a>
          </li>
        </ul>
        <ul>
          <li>
            <a href="/privacy-policy">
              {getText('privacy-policy.nav', language)}
            </a>
          </li>
          <li>
            <a href="/about">{getText('about-this-app.nav', language)}</a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
