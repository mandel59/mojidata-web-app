import Link from 'next/link'
import './styles.css'
import PreviewWarning from '@/components/PreviewWarning'
import '@picocss/pico/css/pico.min.css'

export const metadata = {
  title: 'Mojidata Web App',
  description:
    'Mojidata is an open-source collection of kanji information databases.',
  metadataBase: new URL('https://mojidata.ryusei.dev/'),
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
          <h1>{metadata.title}</h1>
          <PreviewWarning />
          <nav>
            <a href="/">App</a> <a href="/about">About</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
