import { getLanguage } from '@/getText'
import { Metadata } from 'next'
import SearchRoute from '@/features/search/SearchRoute'
import { castToString } from '../searchParams'
import { buildSearchMetadata } from '@/features/search/buildSearchMetadata'
import { resolveExecutionModeOverride } from '@/features/resolveExecutionModeOverride'
import { getClientDataRoutePath } from '@/deliveryPolicy'

type Props = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  return buildSearchMetadata({
    query: castToString(resolvedSearchParams.query),
    page: resolvedSearchParams.page,
  })
}

export default async function SearchSpa({ params, searchParams }: Props) {
  const { lang } = await params
  const language = getLanguage(lang)
  const resolvedSearchParams = await searchParams
  const mode = resolveExecutionModeOverride(
    resolvedSearchParams,
    'client-data',
  )

  return (
    <SearchRoute
      mode={mode}
      language={language}
      formAction={getClientDataRoutePath('search')}
      searchParams={resolvedSearchParams}
    />
  )
}
