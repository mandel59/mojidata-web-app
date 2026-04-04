import { cn } from '@/lib/utils'
import styles from './MojidataSectionNav.module.css'
import surfaceStyles from './Surface.module.css'
import type { MojidataSectionNavSection } from './MojidataSectionNav'

export interface MojidataSectionNavViewProps {
  sections: MojidataSectionNavSection[]
  activeSectionId: string
}

export default function MojidataSectionNavView(
  props: MojidataSectionNavViewProps,
) {
  const { sections, activeSectionId } = props

  return (
    <>
      <nav
        className={`${styles.nav} ${styles.mobile}`}
        aria-label="Mojidata sections"
        data-testid="mojidata-section-nav-mobile"
      >
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={cn(
              surfaceStyles.pillBase,
              surfaceStyles.pillInteractive,
              surfaceStyles.radiusFrame,
              styles.link,
              styles.mobileLink,
              section.id === activeSectionId &&
                cn(surfaceStyles.pillActive, styles.active),
            )}
          >
            {section.label}
          </a>
        ))}
      </nav>
      <aside
        className={styles.sidebar}
        aria-label="Mojidata table of contents"
        data-testid="mojidata-toc-sidebar"
      >
        <nav
          className={`${styles.nav} ${styles.sidebarNav}`}
          aria-label="Mojidata sections"
          data-testid="mojidata-section-nav-sidebar"
        >
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={cn(
                surfaceStyles.pillBase,
                surfaceStyles.pillInteractive,
                surfaceStyles.radiusFrame,
                styles.link,
                styles.sidebarLink,
                section.id === activeSectionId &&
                  cn(surfaceStyles.pillActive, styles.active),
              )}
            >
              {section.label}
            </a>
          ))}
        </nav>
      </aside>
    </>
  )
}
