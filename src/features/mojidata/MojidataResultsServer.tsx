import { ReactElement } from 'react'
import { Language } from '@/getText'
import MojidataResponseView from '@/app/[lang]/mojidata/[char]/MojidataResponseView'
import { loadMojidataResultData } from './loadMojidataResultData'
import { fetchMojidataServer } from './fetchMojidataServer'

interface MojidataResultsServerProps {
  ucs: string
  bot: boolean
  disableExternalLinks: boolean
  forceMojiJohoImage: boolean
  lang: Language
}

export default async function MojidataResultsServer(
  props: MojidataResultsServerProps,
): Promise<ReactElement> {
  const { ucs, bot, disableExternalLinks, forceMojiJohoImage, lang } = props
  const data = await loadMojidataResultData(fetchMojidataServer, ucs)

  return (
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
  )
}
