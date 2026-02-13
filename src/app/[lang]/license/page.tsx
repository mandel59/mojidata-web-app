import { Licence } from './License'

export default function LicensePage(_props: PageProps<'/[lang]/license'>) {
  return (
    <main className="container">
      <article>
        <Licence />
      </article>
    </main>
  )
}
