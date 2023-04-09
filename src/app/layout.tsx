import IdsFinder from '../components/IdsFinder'

export const metadata = {
  title: 'Mojidata Web App',
  description: 'Mojidata is a database of CJKV characters.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <nav>
          <h1>Mojidata Web App</h1>
          <h2>IDS Finder</h2>
          <p>Find CJKV characters with the given IDS.</p>
          <dl>
            <dt>IDS Unary Operators</dt>
            <dd>〾↔↷</dd>
            <dt>IDS Binary Operators</dt>
            <dd>⿰⿱⿴⿵⿶⿷⿸⿹⿺⿻</dd>
            <dt>IDS Ternary Operators</dt>
            <dd>⿲⿳</dd>
          </dl>
          <IdsFinder />
        </nav>
        {children}
      </body>
    </html>
  )
}
