import { About } from './About'
import { Licence } from './License'
import { getLanguage } from '@/getText'

export const runtime = 'experimental-edge'

export interface AboutPageProps {
  params: { lang: string }
}

export default function AboutPage(props: AboutPageProps) {
  const language = getLanguage(props.params.lang)
  return (
    <main className="container">
      <article>
        <About lang={language} />
        <hr />
        <Licence />
      </article>
    </main>
  )
}
