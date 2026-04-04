'use client'

import { cn } from '@/lib/utils'
import skeletonStyles from './Skeleton.module.css'
import dividerStyles from './SectionDivider.module.css'
import surfaceStyles from './Surface.module.css'
import textStyles from './Text.module.css'
import styles from './LoadingArticle.module.css'

export default function LoadingArticle() {
  return (
    <article
      data-testid="loading-article"
      className={cn(
        surfaceStyles.cardSurface,
        surfaceStyles.radiusCard,
        surfaceStyles.paddingLg,
      )}
    >
      <div className={styles.chips} aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              skeletonStyles.pulseBlock,
              surfaceStyles.outlinedFrameSm,
              styles.chip,
            )}
          />
        ))}
      </div>
      <p className={cn(textStyles.mutedBodySm, styles.message)} aria-live="polite">
        Loading...
      </p>
      <footer className={dividerStyles.dividerTop}>
        <div
          className={cn(
            skeletonStyles.pulseBlock,
            surfaceStyles.radiusXs,
            styles.footerBar,
          )}
          aria-hidden
        />
      </footer>
    </article>
  )
}
