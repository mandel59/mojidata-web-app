import type { Metadata } from 'next'
import '@picocss/pico/css/pico.min.css'
import './styles.css'
import PreviewWarning from '@/components/PreviewWarning'
import { canonicalUrlBase, description, siteName } from '@/settings'
import { fontCjkSymbols, fontNotDef } from '../fonts'
import { getLanguage, getText } from '@/getText'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { SiteHeader } from './SiteHeader'

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
        <div className="container mx-auto my-5 grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
          <aside className="lg:sticky lg:top-4">
            <SiteHeader siteName={siteName} language={language} />
          </aside>
          <main className="space-y-4">{children}</main>
        </div>
        <PreviewWarning />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
