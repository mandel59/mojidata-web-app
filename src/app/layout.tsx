import Link from 'next/link'
import './styles.css'
import PreviewWarning from '@/components/PreviewWarning'
import '@picocss/pico/css/pico.min.css'
import { canonicalUrlBase, description, siteName } from '@/settings'

export const metadata = {
  title: {
    default: siteName,
    template: `%s - ${siteName}`,
  },
  description,
  openGraph: {
    title: siteName,
    description,
    url: canonicalUrlBase,
    siteName,
    type: 'website',
  },
  metadataBase: new URL(canonicalUrlBase),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <header className="container">
          <h1>{siteName}</h1>
          <nav>
            <ul>
              <li>
                <a href="/idsfind">IDS Finder</a>
              </li>
              <li>
                <a href="/search">Search</a>
              </li>
            </ul>
            <ul>
              <li>
                <a href="/about">About</a>
              </li>
            </ul>
          </nav>
        </header>
        {children}
        <PreviewWarning />
      </body>
    </html>
  )
}
