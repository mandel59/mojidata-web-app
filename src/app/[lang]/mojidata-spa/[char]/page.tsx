import MojidataSpaClient from './mojidataSpaClient'
import { getLanguage } from '@/getText'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ char: string; lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { char } = await params
  return {
    alternates: {
      canonical: `/mojidata/${char}`,
    },
    robots: {
      index: false,
      follow: true,
    },
  }
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
