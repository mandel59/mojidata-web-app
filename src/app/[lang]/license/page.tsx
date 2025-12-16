import { Licence } from './License'

export const runtime = 'nodejs'

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
