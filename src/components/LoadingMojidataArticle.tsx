'use client'

export default function LoadingMojidataArticle() {
  return (
    <article className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="mb-3 h-7 w-48 animate-pulse rounded bg-muted" aria-hidden />
      <div className="mb-4 flex items-center gap-4">
        <div
          className="h-[120px] w-[120px] animate-pulse rounded-md border border-border bg-muted"
          aria-hidden
        />
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-muted" aria-hidden />
          <div className="h-4 w-28 animate-pulse rounded bg-muted" aria-hidden />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-muted" aria-hidden />
        <div className="h-4 w-[92%] animate-pulse rounded bg-muted" aria-hidden />
        <div className="h-4 w-[78%] animate-pulse rounded bg-muted" aria-hidden />
      </div>
      <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
        Loading character data…
      </p>
    </article>
  )
}
