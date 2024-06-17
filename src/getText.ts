import { Translation } from './translation/Translation'

import { translationEnUs } from './translation/en-US'
import { translationJaJp } from './translation/ja-JP'

const translations = { 'en-US': translationEnUs, 'ja-JP': translationJaJp }

export type Language = keyof typeof translations

export function getLanguage(lang: string): keyof typeof translations {
  switch (lang) {
    case 'ja-JP':
      return 'ja-JP'
    default:
      return 'en-US'
  }
}

export function getText(
  key: keyof Translation,
  lang: Language,
): string {
  return translations[lang][key]
}
