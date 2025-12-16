import { About } from './About'
import { getLanguage } from '@/getText'

export const runtime = 'edge'

export interface AboutPageProps {
  params: Promise<{ lang: string }>
}

export default async function AboutPage({ params }: AboutPageProps) {
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
