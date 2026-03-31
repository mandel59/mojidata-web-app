import { Metadata } from 'next'
import { getLanguage } from '@/getText'
import SearchRoute from '@/features/search/SearchRoute'
import { buildSearchMetadata } from '@/features/search/buildSearchMetadata'
import { castToString } from '../searchParams'
import { resolveExecutionModeOverride } from '@/features/resolveExecutionModeOverride'
import { getCanonicalRoutePath } from '@/deliveryPolicy'

export default async function Search({
  params,
  searchParams,
}: PageProps<'/[lang]/search'>) {
  const { lang } = await params
  const resolvedSearchParams = await searchParams
  const language = getLanguage(lang)
  const mode = resolveExecutionModeOverride(
    resolvedSearchParams,
    'server-data',
  )
  return (
    <SearchRoute
      mode={mode}
      language={language}
      formAction={getCanonicalRoutePath('search')}
      searchParams={resolvedSearchParams}
    />
  )
}

export async function generateMetadata(
  { searchParams }: PageProps<'/[lang]/search'>,
): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  return buildSearchMetadata({
    query: castToString(resolvedSearchParams.query),
    page: resolvedSearchParams.page,
  })
}
