import { Suspense } from 'react'
import type { Language } from '@/getText'
import { getText } from '@/getText'
import type { ExecutionMode } from '@/deliveryPolicy'
import LoadingArticle from '@/components/LoadingArticle'
import IdsfindPageShell from './IdsfindPageShell'
import SpaAssetsPrefetcher from '@/spa/SpaAssetsPrefetcher'
import {
  castToArray,
  castToBooleanFlag,
  castToString,
} from '@/app/[lang]/searchParams'
import IdsfindResultsClient from './IdsfindResultsClient'
import IdsfindResultsServer from './IdsfindResultsServer'

export interface IdsfindRouteProps {
  mode: ExecutionMode
  language: Language
  formAction: string
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function IdsfindRoute(props: IdsfindRouteProps) {
  const { mode, language, formAction, searchParams } = props
  const idsArray = castToArray(searchParams.ids)
  const wholeArray = castToArray(searchParams.whole)
  const query = castToString(searchParams.query)
  const hasQuery = idsArray.length > 0 || wholeArray.length > 0 || !!query
  const isClientData = mode === 'client-data'

  return (
    <IdsfindPageShell
      language={language}
      hasQuery={hasQuery}
      formAction={formAction}
      formNavLabel={getText('ids-finder.nav', language)}
      mobileResultsFormMode="drawer"
      prelude={isClientData ? <SpaAssetsPrefetcher kind="idsfind" /> : undefined}
      results={
        hasQuery ? (
          isClientData ? (
            <div data-spa="idsfind">
              <noscript>
                <p>This page requires JavaScript.</p>
              </noscript>
              <Suspense fallback={<LoadingArticle />}>
                <IdsfindResultsClient />
              </Suspense>
            </div>
          ) : (
            <IdsfindResultsServer
              path={formAction}
              ids={idsArray}
              whole={wholeArray}
              query={query}
              page={searchParams.page ? Number(searchParams.page) : undefined}
              bot={castToBooleanFlag(searchParams.bot)}
              disableExternalLinks={castToBooleanFlag(
                searchParams.disableExternalLinks,
              )}
              extraSearchParams={searchParams}
            />
          )
        ) : undefined
      }
    />
  )
}
