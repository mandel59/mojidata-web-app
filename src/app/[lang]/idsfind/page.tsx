import { Metadata } from 'next'
import { getLanguage } from '@/getText'
import IdsfindRoute from '@/features/idsfind/IdsfindRoute'
import { buildIdsfindMetadata } from '@/features/idsfind/buildIdsfindMetadata'
import { resolveExecutionModeOverride } from '@/features/resolveExecutionModeOverride'
import { resolveRequestExecutionMode } from '@/features/resolveRequestExecutionMode'
import { getCanonicalRoutePath } from '@/deliveryPolicy'

export default async function IdsFind({
  params,
  searchParams,
}: PageProps<'/[lang]/idsfind'>) {
  const { lang } = await params
  const resolvedSearchParams = await searchParams
  const language = getLanguage(lang)
  const defaultMode = await resolveRequestExecutionMode('idsfind')
  const mode = resolveExecutionModeOverride(
    resolvedSearchParams,
    defaultMode,
  )
  return (
    <IdsfindRoute
      mode={mode}
      language={language}
      formAction={getCanonicalRoutePath('idsfind')}
      searchParams={resolvedSearchParams}
    />
  )
}

export async function generateMetadata(
  { searchParams }: PageProps<'/[lang]/idsfind'>,
): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  return buildIdsfindMetadata(resolvedSearchParams)
}
