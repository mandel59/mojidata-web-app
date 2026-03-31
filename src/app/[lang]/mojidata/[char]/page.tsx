import { Metadata } from 'next'
import { getLanguage } from '@/getText'
import { buildMojidataMetadata } from '@/features/mojidata/buildMojidataMetadata'
import MojidataRoute from '@/features/mojidata/MojidataRoute'
import { resolveExecutionModeOverride } from '@/features/resolveExecutionModeOverride'

type Props = {
  params: Promise<{ char: string; lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Mojidata({ params, searchParams }: Props) {
  const { char, lang } = await params
  const resolvedSearchParams = await searchParams
  const language = getLanguage(lang)
  const mode = resolveExecutionModeOverride(
    resolvedSearchParams,
    'server-data',
  )

  return (
    <MojidataRoute
      mode={mode}
      language={language}
      char={char}
      searchParams={resolvedSearchParams}
    />
  )
}

export async function generateMetadata(
  { params, searchParams }: Props,
): Promise<Metadata> {
  const { char } = await params
  const resolvedSearchParams = await searchParams
  const disableExternalLinks =
    resolvedSearchParams?.disableExternalLinks === '1' ||
    (Array.isArray(resolvedSearchParams?.disableExternalLinks) &&
      resolvedSearchParams?.disableExternalLinks.includes('1'))
  return buildMojidataMetadata({ char, disableExternalLinks })
}
