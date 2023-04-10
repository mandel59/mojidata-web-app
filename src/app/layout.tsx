import Link from 'next/link'

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
    <html lang="ja">
      <body>
        <header>
          <h1>{metadata.title}</h1>
          <nav>
            <Link href="/">App</Link> <Link href="/about">About</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
