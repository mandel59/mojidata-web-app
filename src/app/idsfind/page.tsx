import { Suspense } from 'react'
import IdsFindResponse from './IdsFindResponse'
import Loading from '@/components/Loading'
import IdsFinder from '@/components/IdsFinder'

function castToArray<T>(x: undefined | T | T[]): T[] {
  return Array.isArray(x) ? x : x != null ? [x] : []
}

export default function IdsFind({ searchParams }: { searchParams: unknown }) {
  const { ids, whole, page } = searchParams as Partial<
    Record<string, string | string[]>
  >
  return (
    <main>
      <IdsFinder />
      <Suspense fallback={<Loading />}>
        {/* @ts-expect-error Server Component */}
        <IdsFindResponse
          ids={castToArray(ids)}
          whole={castToArray(whole)}
          page={page ? Number(page) : undefined}
        />
      </Suspense>
    </main>
  )
}
