import { Suspense } from 'react'
import IdsFindResponse from './IdsFindResponse'
import Loading from '@/components/Loading'
import IdsFinder from '@/components/IdsFinder'

export const runtime = 'experimental-edge'

function castToArray<T>(x: undefined | T | T[]): T[] {
  return Array.isArray(x) ? x : x != null ? [x] : []
}

export default function IdsFind({ searchParams }: { searchParams: unknown }) {
  const { ids, whole, page } = searchParams as Partial<
    Record<string, string | string[]>
  >
  return (
    <div>
      <main className="container">
        <Suspense fallback={<Loading />}>
          {/* @ts-expect-error Server Component */}
          <IdsFindResponse
            ids={castToArray(ids)}
            whole={castToArray(whole)}
            page={page ? Number(page) : undefined}
          />
        </Suspense>
      </main>
      <nav className="container">
        <IdsFinder />
      </nav>
    </div>
  )
}
