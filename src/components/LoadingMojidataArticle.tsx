'use client'

import { cn } from '@/lib/utils'
import surfaceStyles from './Surface.module.css'
import styles from './LoadingMojidataArticle.module.css'

export default function LoadingMojidataArticle() {
  return (
    <article className={cn(surfaceStyles.cardSurface, styles.article)}>
      <div className={styles.heading} aria-hidden />
      <div className={styles.summary}>
        <div className={styles.glyph} aria-hidden />
        <div className={styles.meta}>
          <div className={styles.metaLineWide} aria-hidden />
          <div className={styles.metaLineNarrow} aria-hidden />
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.bodyLineFull} aria-hidden />
        <div className={styles.bodyLineWide} aria-hidden />
        <div className={styles.bodyLineMedium} aria-hidden />
      </div>
      <p className={styles.message} aria-live="polite">
        Loading character data…
      </p>
    </article>
  )
}
