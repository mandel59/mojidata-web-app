import { GetServerSidePropsContext } from 'next'

import { Suspense } from 'react'
import MojidataResponse from './MojidataResponse'
import Loading from '@/components/Loading'
import IdsFinder from '@/components/IdsFinder'

export default function Mojidata({ params }: { params: { char: string } }) {
  const { char } = params
  return (
    <main>
      <IdsFinder />
      <Suspense fallback={<Loading />}>
        {/* @ts-expect-error Server Component */}
        <MojidataResponse char={char} />
      </Suspense>
    </main>
  )
}
