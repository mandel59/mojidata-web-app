'use client'

export default function LoadingArticle() {
  return (
    <article className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="mb-3 flex flex-wrap gap-2" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="h-16 w-16 animate-pulse rounded-md border border-border bg-muted"
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Loading...
      </p>
      <footer className="mt-4 border-t border-border pt-3">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" aria-hidden />
      </footer>
    </article>
  )
}
