import Link from 'next/link'
import { cn } from '@/lib/utils'
import surfaceStyles from '@/components/Surface.module.css'
import styles from './Pager.module.css'

export interface PagerProps {
  prev?: string | null
  next?: string | null
  pageNum: number
  totalPages: number
  prefetch?: boolean
}

export function Pager(props: PagerProps) {
  const { prev, next, pageNum, totalPages, prefetch } = props

  return (
    <div className={styles.root}>
      <div className={styles.side}>
        {prev ? (
          <Link
            href={prev}
            prefetch={prefetch}
            scroll={false}
            className={cn(
              surfaceStyles.radiusSm,
              surfaceStyles.focusRing,
              surfaceStyles.mutedHoverBg,
              surfaceStyles.mutedHoverFg,
              styles.link,
            )}
          >
            Prev
          </Link>
        ) : (
          <span className={styles.placeholder}>&nbsp;</span>
        )}
      </div>
      <div className={styles.status}>
        page {pageNum} of {totalPages || 1}
      </div>
      <div className={styles.side}>
        {next ? (
          <Link
            href={next}
            prefetch={prefetch}
            scroll={false}
            className={cn(
              surfaceStyles.radiusSm,
              surfaceStyles.focusRing,
              surfaceStyles.mutedHoverBg,
              surfaceStyles.mutedHoverFg,
              styles.link,
            )}
          >
            Next
          </Link>
        ) : (
          <span className={styles.placeholder}>&nbsp;</span>
        )}
      </div>
    </div>
  )
}
