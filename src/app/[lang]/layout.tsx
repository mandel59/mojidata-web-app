import type { Metadata } from 'next'
import { Suspense } from 'react'
import './styles.css'
import PreviewWarning from '@/components/PreviewWarning'
import { canonicalUrlBase, description, siteName } from '@/settings'
import { fontCjkSymbols, fontNotDef } from '../fonts'
import { getLanguage, getText } from '@/getText'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { SiteHeader } from './SiteHeader'
import NavigationPendingIndicator from '@/components/NavigationPendingIndicator'
import styles from './layout.module.css'

export const metadata: Metadata = {
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

export async function generateStaticParams() {
  return [{ lang: 'en-US' }, { lang: 'ja-JP' }]
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  const language = getLanguage(lang)
  return (
    <html lang={language} data-theme="light">
      <body className={`${fontCjkSymbols.variable} ${fontNotDef.variable}`}>
        <Suspense fallback={null}>
          <NavigationPendingIndicator
            label={getText('navigation.loading', language)}
          />
        </Suspense>
        <div className={styles.page}>
          <div className={styles.stack}>
          <SiteHeader siteName={siteName} language={language} />
          <main>{children}</main>
          </div>
        </div>
        <PreviewWarning />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
