import { Suspense } from 'react'
import MojidataResponse from './MojidataResponse'
import Loading from '@/components/Loading'
import IdsFinder from '@/components/IdsFinder'

export const runtime = 'experimental-edge'

export default function Mojidata({ params }: { params: { char: string } }) {
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
