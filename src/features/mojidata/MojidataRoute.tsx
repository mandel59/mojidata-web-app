import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import type { Language } from '@/getText'
import type { ExecutionMode } from '@/deliveryPolicy'
import { getCanonicalRoutePath } from '@/deliveryPolicy'
import LoadingMojidataArticle from '@/components/LoadingMojidataArticle'
import MojidataPageShell from './MojidataPageShell'
import SpaAssetsPrefetcher from '@/spa/SpaAssetsPrefetcher'
import { castToBooleanFlag } from '@/app/[lang]/searchParams'
import MojidataResultsServer from './MojidataResultsServer'
import MojidataResultsClient from './MojidataResultsClient'

export interface MojidataRouteProps {
  mode: ExecutionMode
  language: Language
  char: string
  searchParams: { [key: string]: string | string[] | undefined }
}

function normalizeMojidataChar(char: string) {
  const ucs = decodeURIComponent(char)
  if ((ucs.codePointAt(0) ?? 0) <= 0x7f) {
    notFound()
  }

  const ucsList = [...ucs]
  if (ucsList.length !== 1) {
    if (ucsList.length === 2) {
      if (
        /^\p{sc=Han}$/u.test(ucsList[0]) &&
        /^[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]$/u.test(ucsList[1])
      ) {
        redirect(
          getCanonicalRoutePath('mojidata', encodeURIComponent(ucsList[0])),
        )
      }
    }
    notFound()
  }

  return ucs
}

export default function MojidataRoute(props: MojidataRouteProps) {
  const { mode, language, char, searchParams } = props
  const ucs = normalizeMojidataChar(char)
  const bot = castToBooleanFlag(searchParams.bot)
  const disableExternalLinks = castToBooleanFlag(
    searchParams.disableExternalLinks,
  )
  const forceMojiJohoImage = castToBooleanFlag(searchParams.mojiJohoImage)
  const perfDebug = castToBooleanFlag(searchParams.perf)

  if (mode === 'client-data') {
    return (
      <MojidataPageShell
        spaMarker
        requireJavaScript
        prelude={<SpaAssetsPrefetcher kind="mojidata" />}
      >
        <Suspense fallback={<LoadingMojidataArticle />}>
          <MojidataResultsClient
            char={ucs}
            lang={language}
            bot={bot}
            disableExternalLinks={disableExternalLinks}
            forceMojiJohoImage={forceMojiJohoImage}
            perfDebug={perfDebug}
          />
        </Suspense>
      </MojidataPageShell>
    )
  }

  return (
    <MojidataPageShell>
      <MojidataResultsServer
        ucs={ucs}
        bot={bot}
        disableExternalLinks={disableExternalLinks}
        forceMojiJohoImage={forceMojiJohoImage}
        lang={language}
        perfDebug={perfDebug}
      />
    </MojidataPageShell>
  )
}
