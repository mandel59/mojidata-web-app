import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { MojidataVariantEntry } from '@/components/mojidataVariantEntry'
import styles from './MojidataDeferredVariants.module.css'
import comparisonStyles from './MojidataComparison.module.css'
import surfaceStyles from './Surface.module.css'
import textStyles from './Text.module.css'

export interface MojidataDeferredVariantsViewProps {
  entries: MojidataVariantEntry[]
  expanded: boolean
  toggleLabel: string
  onToggle?: () => void
  renderEntryContent: (entry: MojidataVariantEntry) => ReactNode
}

export default function MojidataDeferredVariantsView(
  props: MojidataDeferredVariantsViewProps,
) {
  const { entries, expanded, toggleLabel, onToggle, renderEntryContent } = props

  if (entries.length === 0) return null

  return (
    <div data-testid="mojidata-deferred-variants-view">
      <div className={styles.actions}>
        <button
          type="button"
          className={cn(
            surfaceStyles.pillBase,
            surfaceStyles.pillInteractive,
            styles.toggle,
          )}
          onClick={onToggle}
          aria-expanded={expanded}
        >
          {toggleLabel}
        </button>
      </div>
      {expanded && (
        <div
          className={`${comparisonStyles.comparison} ${comparisonStyles.variantsComparison}`}
          data-testid="mojidata-variants-comparison"
        >
          {entries.map((entry) => (
            <figure
              key={entry.key}
              className={cn(
                surfaceStyles.whitePanelSurface,
                comparisonStyles.figureCard,
                comparisonStyles.variantsFigureCard,
              )}
            >
              <figcaption>
                <div>{entry.heading}</div>
                {entry.relationLines.map((line) => (
                  <div key={`${entry.key}:${line.label}`}>
                    <small className={textStyles.mutedFg}>
                      {line.label}: {line.values}
                    </small>
                  </div>
                ))}
              </figcaption>
              <div className={entry.className}>{renderEntryContent(entry)}</div>
            </figure>
          ))}
        </div>
      )}
    </div>
  )
}
