import { Licence } from './License'

export default function LicensePage(_props: PageProps<'/[lang]/license'>) {
  return (
    <main className="container">
      <article className="docs-article rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
        <Licence />
      </article>
    </main>
  )
}
