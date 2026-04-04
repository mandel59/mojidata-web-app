'use client'

import { cn } from '@/lib/utils'
import skeletonStyles from './Skeleton.module.css'
import surfaceStyles from './Surface.module.css'
import textStyles from './Text.module.css'
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
      <div
        className={cn(
          skeletonStyles.pulseBlock,
          surfaceStyles.radiusXs,
          styles.heading,
        )}
        aria-hidden
      />
      <div className={styles.summary}>
        <div
          className={cn(
            skeletonStyles.pulseBlock,
            surfaceStyles.outlinedFrameSm,
            styles.glyph,
          )}
          aria-hidden
        />
        <div className={styles.meta}>
          <div
            className={cn(
              skeletonStyles.pulseBlock,
              surfaceStyles.radiusXs,
              styles.metaLineWide,
            )}
            aria-hidden
          />
          <div
            className={cn(
              skeletonStyles.pulseBlock,
              surfaceStyles.radiusXs,
              styles.metaLineNarrow,
            )}
            aria-hidden
          />
        </div>
      </div>
      <div className={styles.body}>
        <div
          className={cn(
            skeletonStyles.pulseBlock,
            surfaceStyles.radiusXs,
            styles.bodyLineFull,
          )}
          aria-hidden
        />
        <div
          className={cn(
            skeletonStyles.pulseBlock,
            surfaceStyles.radiusXs,
            styles.bodyLineWide,
          )}
          aria-hidden
        />
        <div
          className={cn(
            skeletonStyles.pulseBlock,
            surfaceStyles.radiusXs,
            styles.bodyLineMedium,
          )}
          aria-hidden
        />
      </div>
      <p className={cn(textStyles.mutedBodySm, styles.message)} aria-live="polite">
        Loading character data…
      </p>
    </article>
  )
}
