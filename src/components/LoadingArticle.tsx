'use client'

import styles from './LoadingArticle.module.css'

export default function LoadingArticle() {
  return (
    <article className={styles.article}>
      <div className={styles.chips} aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className={styles.chip} />
        ))}
      </div>
      <p className={styles.message} aria-live="polite">
        Loading...
      </p>
      <footer className={styles.footer}>
        <div className={styles.footerBar} aria-hidden />
      </footer>
    </article>
  )
}
