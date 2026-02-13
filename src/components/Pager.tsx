'use client'

import Link from 'next/link'
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
  return (
    <div className="flex flex-row items-center justify-center gap-3 sm:gap-4">
      <div className="w-20 text-center">
        {prev ? (
          <Link
            rel="prev"
            href={prev}
            scroll={false}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
          >
            Prev
          </Link>
        ) : (
          <span className="inline-block w-full text-muted-foreground">&nbsp;</span>
        )}
      </div>
      <div className="w-32 text-center text-sm font-medium text-muted-foreground">
        page {pageNum} of {totalPages || 1}
      </div>
      <div className="w-20 text-center">
        {next ? (
          <Link
            rel="next"
            href={next}
            scroll={false}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
          >
            Next
          </Link>
        ) : (
          <span className="inline-block w-full text-muted-foreground">&nbsp;</span>
        )}
      </div>
    </div>
  )
}
