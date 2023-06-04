import { Metadata, ResolvingMetadata } from 'next'
import { Suspense } from 'react'
import MojidataResponse from './MojidataResponse'
import Loading from '@/components/Loading'
import IdsFinder from '@/components/IdsFinder'

export const runtime = 'experimental-edge'

type Props = {
  params: { char: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function Mojidata({ params }: Props) {
  const { char } = params
  return (
    <div>
      <main className="container">
        <Suspense fallback={<Loading />}>
          {/* @ts-expect-error Server Component */}
          <MojidataResponse char={char} />
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
  return {
    alternates: {
      canonical: `/mojidata/${char}`,
    },
  }
}
