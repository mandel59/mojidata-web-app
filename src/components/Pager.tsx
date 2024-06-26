import Link from 'next/link'
import './Pager.css'

export interface PagerProps {
  prev?: string | null
  next?: string | null
  pageNum: number
  totalPages: number
}

export function Pager(props: PagerProps) {
  const { prev, next, pageNum, totalPages } = props
  return (
    <div className="pager">
      <div className="prev">
        {prev ? (
          <Link rel="prev" role="button" href={prev} scroll={false}>
            Prev
          </Link>
        ) : (
          ' '
        )}
      </div>
      <div className="pagenum">
        {/* if totalPages is 0, show 1. */}
        page {pageNum} of {totalPages || 1}
      </div>
      <div className="next">
        {next ? (
          <Link rel="next" role="button" href={next} scroll={false}>
            Next
          </Link>
        ) : (
          ' '
        )}
      </div>
    </div>
  )
}
