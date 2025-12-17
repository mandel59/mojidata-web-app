import { Licence } from './License'

export interface LicensePageProps {
  params: Promise<{ lang: string }>
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
