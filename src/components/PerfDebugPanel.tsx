import type { ReactElement } from 'react'

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
      className="rounded-md border border-border bg-card p-3 text-sm text-card-foreground"
    >
      <summary className="cursor-pointer font-medium">
        {title} ({mode})
      </summary>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        {metrics.map((metric) => (
          <div key={metric.label} className="contents">
            <dt className="text-muted-foreground">{metric.label}</dt>
            <dd>{formatDuration(metric.durationMs)}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}
