import Link from 'next/link'
import './styles.css'
import PreviewWarning from '@/components/PreviewWarning'

export const metadata = {
  title: 'Mojidata Web App',
  description:
    'Mojidata is an open-source collection of kanji information databases.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header>
          <h1>{metadata.title}</h1>
          <PreviewWarning />
          <nav>
            <Link href="/">App</Link> <Link href="/about">About</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
