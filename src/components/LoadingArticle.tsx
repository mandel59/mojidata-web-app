'use client'

import { cn } from '@/lib/utils'
import dividerStyles from './SectionDivider.module.css'
import surfaceStyles from './Surface.module.css'
import styles from './LoadingArticle.module.css'

export default function LoadingArticle() {
  return (
    <article className={cn(surfaceStyles.cardSurface, styles.article)}>
      <div className={styles.chips} aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className={styles.chip} />
        ))}
      </div>
      <p className={styles.message} aria-live="polite">
        Loading...
      </p>
      <footer className={dividerStyles.dividerTop}>
        <div className={styles.footerBar} aria-hidden />
      </footer>
    </article>
  )
}
