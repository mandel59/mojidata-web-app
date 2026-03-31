import type { Language } from '@/getText'
import { getText } from '@/getText'
import type { ExecutionMode } from '@/deliveryPolicy'
import { Suspense } from 'react'
import LoadingArticle from '@/components/LoadingArticle'
import SearchPageShell from './SearchPageShell'
import SearchResultsClient from './SearchResultsClient'
import SpaAssetsPrefetcher from '@/spa/SpaAssetsPrefetcher'
import { castToBooleanFlag, castToString } from '@/app/[lang]/searchParams'
import IdsfindResultsServer from '@/features/idsfind/IdsfindResultsServer'

export interface SearchRouteProps {
  mode: ExecutionMode
  language: Language
  formAction: string
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function SearchRoute(props: SearchRouteProps) {
  const { mode, language, formAction, searchParams } = props
  const query = castToString(searchParams.query).trim()
  const isClientData = mode === 'client-data'

  return (
    <SearchPageShell
      language={language}
      query={query}
      formAction={formAction}
      formNavLabel={getText('mojidata-search.nav', language)}
      mobileResultsFormMode="drawer"
      prelude={isClientData ? <SpaAssetsPrefetcher kind="idsfind" /> : undefined}
      results={
        query ? (
          isClientData ? (
            <div data-spa="search">
              <noscript>
                <p>This page requires JavaScript.</p>
              </noscript>
              <Suspense fallback={<LoadingArticle />}>
                <SearchResultsClient />
              </Suspense>
            </div>
          ) : (
            <IdsfindResultsServer
              path={formAction}
              ids={[]}
              whole={[]}
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
