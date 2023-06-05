import { Metadata, ResolvingMetadata } from 'next'
import { Suspense } from 'react'
import MojidataResponse from './MojidataResponse'
import Loading from '@/components/Loading'
import IdsFinder from '@/components/IdsFinder'
import { notFound } from 'next/navigation'

export const runtime = 'experimental-edge'

type Props = {
  params: { char: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function Mojidata({ params }: Props) {
  const { char } = params
  const ucs = decodeURIComponent(char)
  if ((ucs.codePointAt(0) ?? 0) <= 0x7f) {
    notFound()
  }
  if ([...ucs].length !== 1) {
    notFound()
  }

  return (
    <div>
      <main className="container">
        <Suspense fallback={<Loading />}>
          {/* @ts-expect-error Server Component */}
          <MojidataResponse ucs={ucs} />
        </Suspense>
      </main>
      <nav className="container">
        <IdsFinder />
      </nav>
    </div>
  )
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { char } = params
  const ucs = String.fromCodePoint(
    decodeURIComponent(char).codePointAt(0) ?? 0x20,
  )
  const codePoint =
    ucs.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0') ?? 0x20
  const siteName = 'Mojidata Web App'
  const title = `U+${codePoint} ${ucs}`
  const description = `Character data for U+${codePoint} ${ucs}`
  return {
    title,
    alternates: {
      canonical: `/mojidata/${char}`,
    },
    openGraph: {
      title,
      description,
      siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: `U+${codePoint} ${ucs} - ${siteName}`,
      description,
      creator: '@mandel59',
    },
  }
}
