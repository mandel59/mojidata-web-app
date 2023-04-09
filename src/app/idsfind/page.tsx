import { GetServerSidePropsContext } from 'next'

import { Suspense } from 'react'
import IdsFindResponse from './IdsFindResponse'
import Loading from '@/components/Loading'

function castToArray<T>(x: undefined | T | T[]): T[] {
  return Array.isArray(x) ? x : x != null ? [x] : []
}

export default function IdsFind({ searchParams }: { searchParams: unknown }) {
  const { ids, whole } = searchParams as Partial<
    Record<string, string | string[]>
  >
  return (
    <main>
      <Suspense fallback={<Loading />}>
        {/* @ts-expect-error Server Component */}
        <IdsFindResponse ids={castToArray(ids)} whole={castToArray(whole)} />
      </Suspense>
    </main>
  )
}
