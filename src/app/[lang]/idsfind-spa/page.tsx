import { Metadata } from 'next'
import { getLanguage } from '@/getText'
import IdsfindRoute from '@/features/idsfind/IdsfindRoute'
import { buildIdsfindMetadata } from '@/features/idsfind/buildIdsfindMetadata'
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
  return buildIdsfindMetadata(resolvedSearchParams)
}

export default async function IdsFindSpa({ params, searchParams }: Props) {
  const { lang } = await params
  const resolvedSearchParams = await searchParams
  const language = getLanguage(lang)
  const mode = resolveExecutionModeOverride(
    resolvedSearchParams,
    'client-data',
  )

  return (
    <IdsfindRoute
      mode={mode}
      language={language}
      formAction={getClientDataRoutePath('idsfind')}
      searchParams={resolvedSearchParams}
    />
  )
}
