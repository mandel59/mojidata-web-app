import type { ReactElement } from 'react'
import { cn } from '@/lib/utils'
import surfaceStyles from './Surface.module.css'
import styles from './PerfDebugPanel.module.css'

export interface PerfDebugMetric {
  label: string
  durationMs: number
}

export interface PerfDebugPanelProps {
  title?: string
  mode: string
  metrics: PerfDebugMetric[]
}

function formatDuration(durationMs: number) {
  return `${durationMs.toFixed(1)} ms`
}

export default function PerfDebugPanel(
  props: PerfDebugPanelProps,
): ReactElement {
  const { title = 'Performance', mode, metrics } = props

  return (
    <details
      open
      className={cn(
        surfaceStyles.cardSurface,
        surfaceStyles.radiusSm,
        surfaceStyles.paddingMd,
        styles.panel,
      )}
    >
      <summary className={styles.summary}>
        {title} ({mode})
      </summary>
      <dl className={styles.metrics}>
        {metrics.map((metric) => (
          <div key={metric.label} className={styles.metricRow}>
            <dt className={styles.metricLabel}>{metric.label}</dt>
            <dd>{formatDuration(metric.durationMs)}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}
