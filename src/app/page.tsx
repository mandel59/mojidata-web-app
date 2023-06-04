import IdsFinder from '@/components/IdsFinder'

export const runtime = 'experimental-edge'

export default function Home() {
  return (
    <nav className="container">
      <IdsFinder />
    </nav>
  )
}

export const metadata = {
  alternates: {
    canonical: '/',
  },
}
