import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { getLanguage } from '@/getText'
import type { Language } from '@/getText'
import { siteName } from '@/settings'
import { SiteHeader } from '@/app/[lang]/SiteHeader'
import SearchPageShell from '@/features/search/SearchPageShell'
import SearchResultsClient from '@/features/search/SearchResultsClient'
import IdsfindPageShell from '@/features/idsfind/IdsfindPageShell'
import IdsfindResultsClient from '@/features/idsfind/IdsfindResultsClient'
import MojidataPageShell from '@/features/mojidata/MojidataPageShell'
import MojidataResultsClient from '@/features/mojidata/MojidataResultsClient'
import layoutStyles from '@/app/[lang]/layout.module.css'
import { useLocationSnapshot, navigate } from './next-navigation'
import '@/app/[lang]/fonts.css'
import '@/app/[lang]/theme.css'
import '@/app/[lang]/base.css'
import '../styles.css'

const mainOrigin = 'https://mojidata.ryusei.dev'

function stripLocalePrefix(pathname: string) {
  return pathname.replace(/^\/[a-z]{2}-[A-Z]{2}(?=\/)/, '')
}

function getLocalePrefix(pathname: string) {
  return pathname.match(/^\/([a-z]{2}-[A-Z]{2})(?=\/)/)?.[1]
}

function normalizePathname(pathname: string) {
  const withoutLocale = stripLocalePrefix(pathname)
  if (withoutLocale === '/' || withoutLocale === '') return '/search'
  if (withoutLocale === '/search-spa') return '/search'
  if (withoutLocale === '/idsfind-spa') return '/idsfind'
  if (withoutLocale.startsWith('/mojidata-spa/')) {
    return withoutLocale.replace('/mojidata-spa/', '/mojidata/')
  }
  return withoutLocale
}

function normalizeRouteChar(value: string) {
  const decoded = decodeURIComponent(value)
  const m = decoded.match(/^[uU]\+?([0-9a-fA-F]{4,6})$/)
  if (!m) return decoded
  const cp = Number.parseInt(m[1], 16)
  return Number.isFinite(cp) ? String.fromCodePoint(cp) : decoded
}

function codePointLabel(char: string) {
  return [...char]
    .map((c) => `U+${c.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')}`)
    .join(' ')
}

function canonicalUrl(pathname: string, searchParams = new URLSearchParams()) {
  const qs = searchParams.toString()
  return `${mainOrigin}${pathname}${qs ? `?${qs}` : ''}`
}

function updateCanonical(pathname: string, searchParams = new URLSearchParams()) {
  const href = canonicalUrl(pathname, searchParams)
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}

function routeFromSnapshot(snapshot: string) {
  const url = new URL(snapshot, window.location.origin)
  const language = getLanguage(getLocalePrefix(url.pathname) ?? 'en-US')
  return {
    language,
    pathname: normalizePathname(url.pathname),
    searchParams: url.searchParams,
  }
}

function useRouteSideEffects(params: {
  language: Language
  pathname: string
  searchParams: URLSearchParams
}) {
  const { language, pathname, searchParams } = params
  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dataset.theme = 'light'

    if (pathname === '/search') {
      updateCanonical('/search', searchParams)
      document.title = `Search - ${siteName}`
      return
    }
    if (pathname === '/idsfind') {
      updateCanonical('/idsfind', searchParams)
      document.title = `IDS Find - ${siteName}`
      return
    }
    if (pathname.startsWith('/mojidata/')) {
      const char = normalizeRouteChar(pathname.split('/')[2] ?? '')
      updateCanonical(`/mojidata/${encodeURIComponent(char)}`)
      document.title = `${char} ${codePointLabel(char)} - ${siteName}`
      return
    }

    navigate('/search', { replace: true })
  }, [language, pathname, searchParams])
}

function SearchRoute(props: { language: Language; searchParams: URLSearchParams }) {
  const { language, searchParams } = props
  const query = (searchParams.get('query') ?? '').trim()
  return (
    <div data-spa="search">
      <SearchPageShell
        language={language}
        query={query}
        formAction="/search"
        formNavLabel="Search"
        mobileResultsFormMode="drawer"
        results={<SearchResultsClient />}
      />
    </div>
  )
}

function IdsfindRoute(props: {
  language: Language
  searchParams: URLSearchParams
}) {
  const { language, searchParams } = props
  const hasQuery =
    searchParams.has('ids') ||
    searchParams.has('whole') ||
    !!searchParams.get('query')?.trim()
  return (
    <div data-spa="idsfind">
      <IdsfindPageShell
        language={language}
        hasQuery={hasQuery}
        formAction="/idsfind"
        formNavLabel="IDS Find"
        mobileResultsFormMode="drawer"
        results={<IdsfindResultsClient />}
      />
    </div>
  )
}

function MojidataRoute(props: { language: Language; pathname: string }) {
  const { language, pathname } = props
  const char = normalizeRouteChar(pathname.split('/')[2] ?? '')
  return (
    <MojidataPageShell spaMarker requireJavaScript>
      <MojidataResultsClient
        char={char}
        lang={language}
        bot
        disableExternalLinks
        forceMojiJohoImage={false}
        perfDebug={false}
      />
    </MojidataPageShell>
  )
}

function App() {
  const snapshot = useLocationSnapshot()
  const { language, pathname, searchParams } = routeFromSnapshot(snapshot)
  useRouteSideEffects({ language, pathname, searchParams })

  let route = <SearchRoute language={language} searchParams={searchParams} />
  if (pathname === '/idsfind') {
    route = <IdsfindRoute language={language} searchParams={searchParams} />
  } else if (pathname.startsWith('/mojidata/')) {
    route = <MojidataRoute language={language} pathname={pathname} />
  }

  return (
    <div className={layoutStyles.page}>
      <div className={layoutStyles.stack}>
        <SiteHeader siteName={siteName} language={language} />
        <main>{route}</main>
      </div>
    </div>
  )
}

const root = document.querySelector<HTMLElement>('#app')
if (root) {
  createRoot(root).render(<App />)
}
