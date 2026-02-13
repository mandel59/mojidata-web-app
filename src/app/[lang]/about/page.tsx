import { About } from './About'
import { getLanguage } from '@/getText'

export default async function AboutPage({
  params,
}: PageProps<'/[lang]/about'>) {
  const { lang } = await params
  const language = getLanguage(lang)
  return (
    <main className="container">
      <article className="docs-article rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
        <About lang={language} />
      </article>
    </main>
  )
}
