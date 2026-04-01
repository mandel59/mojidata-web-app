import { Licence } from './License'
import styles from '../DocsPage.module.css'
import cardStyles from '@/components/ArticleCard.module.css'
import richTextStyles from '@/components/RichText.module.css'
import surfaceStyles from '@/components/Surface.module.css'

export default function LicensePage(_props: PageProps<'/[lang]/license'>) {
  return (
    <article
      className={`${surfaceStyles.cardSurface} ${cardStyles.card} ${richTextStyles.richText} ${styles.article}`}
    >
      <Licence />
    </article>
  )
}
