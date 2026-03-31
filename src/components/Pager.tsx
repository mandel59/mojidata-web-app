import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

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
            href={prev}
            prefetch={false}
            scroll={false}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
          >
            Prev
          </Link>
        ) : (
          <span className="inline-block w-full text-muted-foreground">&nbsp;</span>
        )}
      </div>
      <div className="w-40 text-center text-sm font-medium text-muted-foreground">
        page {pageNum} of {totalPages || 1}
      </div>
      <div className="w-20 text-center">
        {next ? (
          <Link
            href={next}
            prefetch={false}
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
