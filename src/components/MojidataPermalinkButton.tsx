'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import type { Language } from '@/getText'
import { getText } from '@/getText'
import styles from './MojidataPermalinkButton.module.css'

export interface MojidataPermalinkButtonProps {
  lang: Language
}

export default function MojidataPermalinkButton(
  props: MojidataPermalinkButtonProps,
) {
  const { lang } = props
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)

  return (
    <a
      href={pathname}
      className={styles.button}
      onClick={async (event) => {
        if (typeof window === 'undefined' || !navigator.clipboard) return
        const url = `${window.location.origin}${window.location.pathname}`
        event.preventDefault()
        await navigator.clipboard.writeText(url)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1400)
      }}
    >
      {copied
        ? getText('summary.permalink.copied', lang)
        : getText('summary.permalink.copy', lang)}
    </a>
  )
}
