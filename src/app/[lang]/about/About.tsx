import { Language } from '@/getText'
import { AboutEnUs } from './AboutEnUs'
import { AboutJaJp } from './AboutJaJp'

export interface AboutProps {
  lang: Language
}
export function About(props: AboutProps) {
  switch (props.lang) {
    case 'ja-JP':
      return <AboutJaJp />
    case 'en-US':
      return <AboutEnUs />
  }
}
