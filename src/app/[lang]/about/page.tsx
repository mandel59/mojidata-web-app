import { About } from './About'
import { getLanguage } from '@/getText'
import styles from '../DocsPage.module.css'

export default async function AboutPage({
  params,
}: PageProps<'/[lang]/about'>) {
  const { lang } = await params
  const language = getLanguage(lang)
  return (
    <main className="container">
      <article className={`docs-article ${styles.article}`}>
        <About lang={language} />
      </article>
    </main>
  )
}
