import { Licence } from './License'

export const runtime = 'experimental-edge'

export interface LicensePageProps {
  params: { lang: string }
}

export default function LicensePage(_props: LicensePageProps) {
  return (
    <main className="container">
      <article>
        <Licence />
      </article>
    </main>
  )
}

