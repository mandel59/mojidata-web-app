import { About } from './About'
import { getLanguage } from '@/getText'

export default async function AboutPage({
  params,
}: PageProps<'/[lang]/about'>) {
  const { lang } = await params
  const language = getLanguage(lang)
  return (
    <main className="container">
      <article>
        <About lang={language} />
      </article>
    </main>
  )
}
