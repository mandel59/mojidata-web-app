import MojidataSpaClient from './mojidataSpaClient'
import { getLanguage } from '@/getText'

type Props = {
  params: Promise<{ char: string; lang: string }>
}

export default async function MojidataSpa({ params }: Props) {
  const { char, lang } = await params
  const ucs = decodeURIComponent(char)
  const language = getLanguage(lang)

  return (
    <div>
      <main className="container">
        <div data-spa="mojidata">
          <noscript>
            <p>This page requires JavaScript.</p>
          </noscript>
          <MojidataSpaClient char={ucs} lang={language} />
        </div>
      </main>
    </div>
  )
}
