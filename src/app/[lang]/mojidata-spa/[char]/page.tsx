import MojidataSpaClient from './mojidataSpaClient'

type Props = {
  params: Promise<{ char: string; lang: string }>
}

export default async function MojidataSpa({ params }: Props) {
  const { char } = await params
  const ucs = decodeURIComponent(char)

  return (
    <div className="container">
      <main>
        <article data-spa="mojidata">
          <h1>Mojidata (SPA)</h1>
          <noscript>
            <p>This page requires JavaScript.</p>
          </noscript>
          <MojidataSpaClient char={ucs} />
        </article>
      </main>
    </div>
  )
}

