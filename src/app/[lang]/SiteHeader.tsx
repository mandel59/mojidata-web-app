'use client'

import { getCanonicalRoutePath } from '@/deliveryPolicy'
import { getText, Language } from '@/getText'
import { cn } from '@/lib/utils'
import surfaceStyles from '@/components/Surface.module.css'
import textStyles from '@/components/Text.module.css'
import Link from 'next/link'
import styles from './SiteHeader.module.css'

export interface SiteHeaderProps {
  siteName: string
  language: Language
}

export function SiteHeader(props: SiteHeaderProps) {
  const { siteName, language } = props
  const searchPath = getCanonicalRoutePath('search')
  const idsfindPath = getCanonicalRoutePath('idsfind')

  return (
    <header className={cn(surfaceStyles.radiusInset, styles.header)}>
      <div className={styles.layout}>
        <div className={styles.primary}>
          <Link
            className={styles.siteName}
            href={searchPath}
          >
            {siteName}
          </Link>

          <nav aria-label="Primary" className={styles.nav}>
            <Link
              className={cn(
                surfaceStyles.compactControlBase,
                surfaceStyles.radiusXs,
                surfaceStyles.mutedHoverBg,
                surfaceStyles.mutedHoverFg,
                textStyles.mutedFg,
                styles.navLink,
              )}
              href={searchPath}
            >
              {getText('mojidata-search.nav', language)}
            </Link>
            <Link
              className={cn(
                surfaceStyles.compactControlBase,
                surfaceStyles.radiusXs,
                surfaceStyles.mutedHoverBg,
                surfaceStyles.mutedHoverFg,
                textStyles.mutedFg,
                styles.navLink,
              )}
              href={idsfindPath}
            >
              {getText('ids-finder.nav', language)}
            </Link>
          </nav>
        </div>

        <details className={styles.more}>
          <summary
            className={cn(
              surfaceStyles.compactControlBase,
              surfaceStyles.radiusSm,
              surfaceStyles.focusRing,
              surfaceStyles.mutedHoverBg,
              surfaceStyles.mutedHoverFg,
              textStyles.mutedFg,
              styles.moreSummary,
            )}
          >
            More
          </summary>
          <div
            role="menu"
            aria-label="Secondary navigation"
            className={cn(
              surfaceStyles.outlinedSurface,
              surfaceStyles.radiusSm,
              styles.menu,
            )}
          >
            <Link
              role="menuitem"
              className={cn(
                surfaceStyles.radiusXs,
                surfaceStyles.focusRing,
                surfaceStyles.mutedHoverBg,
                styles.menuLink,
              )}
              href="/about"
            >
              {getText('about-this-app.nav', language)}
            </Link>
            <div className={styles.menuSpacer} aria-hidden="true"></div>
            <Link
              role="menuitem"
              className={cn(
                surfaceStyles.radiusXs,
                surfaceStyles.focusRing,
                surfaceStyles.mutedHoverBg,
                styles.menuLink,
              )}
              href="/license"
            >
              {getText('license.nav', language)}
            </Link>
            <Link
              role="menuitem"
              className={cn(
                surfaceStyles.radiusXs,
                surfaceStyles.focusRing,
                surfaceStyles.mutedHoverBg,
                styles.menuLink,
              )}
              href="/privacy-policy"
            >
              {getText('privacy-policy.nav', language)}
            </Link>
          </div>
        </details>
      </div>
    </header>
  )
}
