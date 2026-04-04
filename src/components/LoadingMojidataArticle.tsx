'use client'

import { cn } from '@/lib/utils'
import skeletonStyles from './Skeleton.module.css'
import surfaceStyles from './Surface.module.css'
import styles from './LoadingMojidataArticle.module.css'

export default function LoadingMojidataArticle() {
  return (
    <article
      className={cn(
        surfaceStyles.cardSurface,
        surfaceStyles.radiusMd,
        surfaceStyles.paddingLg,
      )}
    >
      <div className={cn(skeletonStyles.pulseBlock, styles.heading)} aria-hidden />
      <div className={styles.summary}>
        <div className={cn(skeletonStyles.pulseBlock, styles.glyph)} aria-hidden />
        <div className={styles.meta}>
          <div className={cn(skeletonStyles.pulseBlock, styles.metaLineWide)} aria-hidden />
          <div className={cn(skeletonStyles.pulseBlock, styles.metaLineNarrow)} aria-hidden />
        </div>
      </div>
      <div className={styles.body}>
        <div className={cn(skeletonStyles.pulseBlock, styles.bodyLineFull)} aria-hidden />
        <div className={cn(skeletonStyles.pulseBlock, styles.bodyLineWide)} aria-hidden />
        <div className={cn(skeletonStyles.pulseBlock, styles.bodyLineMedium)} aria-hidden />
      </div>
      <p className={styles.message} aria-live="polite">
        Loading character data…
      </p>
    </article>
  )
}
