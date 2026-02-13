'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface PagerProps {
  prev?: string | null
  next?: string | null
  pageNum: number
  totalPages: number
}

export function Pager(props: PagerProps) {
  const { prev, next, pageNum, totalPages } = props
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const navigate = (href: string) => {
    startTransition(() => {
      router.push(href, { scroll: false })
    })
  }

  return (
    <div className="relative flex flex-row items-center justify-center gap-3 sm:gap-4" aria-busy={isPending}>
      <div className="w-20 text-center">
        {prev ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => navigate(prev)}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
          >
            Prev
          </button>
        ) : (
          <span className="inline-block w-full text-muted-foreground">&nbsp;</span>
        )}
      </div>
      <div className="w-40 text-center text-sm font-medium text-muted-foreground">
        page {pageNum} of {totalPages || 1}
      </div>
      <div className="w-20 text-center">
        {next ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => navigate(next)}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
          >
            Next
          </button>
        ) : (
          <span className="inline-block w-full text-muted-foreground">&nbsp;</span>
        )}
      </div>
      {isPending && (
        <span className="pointer-events-none absolute -top-5 right-0 text-xs text-muted-foreground">
          Updating…
        </span>
      )}
    </div>
  )
}
