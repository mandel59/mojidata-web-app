import { About } from './About'
import { getLanguage } from '@/getText'
import styles from '../DocsPage.module.css'
import cardStyles from '@/components/ArticleCard.module.css'
import richTextStyles from '@/components/RichText.module.css'
import surfaceStyles from '@/components/Surface.module.css'

export default async function AboutPage({
  params,
}: PageProps<'/[lang]/about'>) {
  const { lang } = await params
  const language = getLanguage(lang)
  return (
    <article
      className={`${surfaceStyles.cardSurface} ${cardStyles.card} ${richTextStyles.richText} ${styles.article}`}
    >
      <About lang={language} />
    </article>
  )
}
