import { ReactElement } from 'react'
import { performance } from 'node:perf_hooks'
import { Language } from '@/getText'
import MojidataResponseView from '@/app/[lang]/mojidata/[char]/MojidataResponseView'
import { loadMojidataResultData } from './loadMojidataResultData'
import { fetchMojidataServer } from './fetchMojidataServer'
import PerfDebugPanel, { type PerfDebugMetric } from '@/components/PerfDebugPanel'

interface MojidataResultsServerProps {
  ucs: string
  bot: boolean
  disableExternalLinks: boolean
  forceMojiJohoImage: boolean
  lang: Language
  perfDebug: boolean
}

export default async function MojidataResultsServer(
  props: MojidataResultsServerProps,
): Promise<ReactElement> {
  const {
    ucs,
    bot,
    disableExternalLinks,
    forceMojiJohoImage,
    lang,
    perfDebug,
  } = props
  const fetchMetrics: PerfDebugMetric[] = []
  const totalStart = performance.now()
  const data = await loadMojidataResultData(async (char) => {
    const startedAt = performance.now()
    const result = await fetchMojidataServer(char)
    fetchMetrics.push({
      label: `fetch ${char}`,
      durationMs: performance.now() - startedAt,
    })
    return result
  }, ucs)
  const totalDurationMs = performance.now() - totalStart

  return (
    <>
      {perfDebug ? (
        <PerfDebugPanel
          mode="server-data"
          metrics={[
            { label: 'total data load', durationMs: totalDurationMs },
            ...fetchMetrics,
          ]}
        />
      ) : null}
      <MojidataResponseView
        ucs={ucs}
        results={data.results}
        canonicalCharacter={data.canonicalCharacter}
        compatibilityCharacters={data.compatibilityCharacters}
        isCompatibilityCharacter={data.isCompatibilityCharacter}
        bot={bot}
        disableExternalLinks={disableExternalLinks}
        forceMojiJohoImage={forceMojiJohoImage}
        lang={lang}
      />
    </>
  )
}
