import { getText, Language } from '@/getText'
import Link from 'next/link'

export interface SiteHeaderProps {
  siteName: string
  language: Language
}

export function SiteHeader(props: SiteHeaderProps) {
  const { siteName, language } = props
  return (
    <header className="container mx-auto my-5">
      <div className="mb-1.5">
        <h1 className="mb-1 text-[clamp(2rem,2.6vw,3rem)]">
          <Link className="text-inherit no-underline" href="/search">
            {siteName}
          </Link>
        </h1>
      </div>
      <nav
        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border pt-3 max-[900px]:flex-col max-[900px]:items-start"
        aria-label="Global"
      >
        <ul className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 p-0">
          <li>
            <Link
              className="rounded-md px-2 py-1 font-semibold transition-colors hover:bg-muted"
              href="/idsfind"
            >
              {getText('ids-finder.nav', language)}
            </Link>
          </li>
          <li>
            <Link
              className="rounded-md px-2 py-1 font-semibold transition-colors hover:bg-muted"
              href="/search"
            >
              {getText('mojidata-search.nav', language)}
            </Link>
          </li>
        </ul>
        <ul className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 p-0">
          <li>
            <Link
              className="rounded-md px-2 py-1 opacity-90 transition-colors hover:bg-muted"
              href="/privacy-policy"
            >
              {getText('privacy-policy.nav', language)}
            </Link>
          </li>
          <li>
            <Link
              className="rounded-md px-2 py-1 opacity-90 transition-colors hover:bg-muted"
              href="/about"
            >
              {getText('about-this-app.nav', language)}
            </Link>
          </li>
          <li>
            <Link
              className="rounded-md px-2 py-1 opacity-90 transition-colors hover:bg-muted"
              href="/license"
            >
              {getText('license.nav', language)}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
