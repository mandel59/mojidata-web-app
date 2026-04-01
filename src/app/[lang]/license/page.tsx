import { Licence } from './License'
import styles from '../DocsPage.module.css'

export default function LicensePage(_props: PageProps<'/[lang]/license'>) {
  return (
    <article className={styles.article}>
      <Licence />
    </article>
  )
}
