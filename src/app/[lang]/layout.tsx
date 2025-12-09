import './styles.css'
import PreviewWarning from '@/components/PreviewWarning'
import '@picocss/pico/css/pico.min.css'
import { canonicalUrlBase, description, siteName } from '@/settings'
import { fontCjkSymbols, fontNotDef } from '../fonts'
import { getLanguage, getText } from '@/getText'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { SiteHeader } from './SiteHeader'

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
  params: { lang },
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  const language = getLanguage(lang)
  return (
    <html lang={language} data-theme="light">
      <body className={`${fontCjkSymbols.variable} ${fontNotDef.variable}`}>
        <SiteHeader siteName={siteName} language={language} />
        {children}
        <PreviewWarning />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
