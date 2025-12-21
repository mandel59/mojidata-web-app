import { ReactElement } from 'react'
import { fetchMojidata } from './mojidata'
import MojidataResponseView from './MojidataResponseView'
import { Language } from '@/getText'

interface MojidataResponseParams {
  ucs: string
  langPrefix: string
  bot: boolean
  disableExternalLinks: boolean
  lang: Language
}

export default async function MojidataResponse(
  params: MojidataResponseParams,
): Promise<ReactElement> {
  const { ucs, langPrefix, bot, disableExternalLinks, lang } = params

  const results = await fetchMojidata(ucs)

  const cjkci = results.svs_cjkci.map((record) => record.CJKCI_char)
  const isCompatibilityCharacter =
    results.svs_cjkci.length > 0 && cjkci[0] === ucs
  const canonicalCharacter = isCompatibilityCharacter
    ? await fetchMojidata([...results.svs_cjkci[0].SVS_char][0])
    : results
  const compatibilityCharacters = !isCompatibilityCharacter
    ? await Promise.all(cjkci.map((char) => fetchMojidata(char)))
    : undefined

  return (
    <MojidataResponseView
      ucs={ucs}
      results={results}
      canonicalCharacter={canonicalCharacter}
      compatibilityCharacters={compatibilityCharacters}
      isCompatibilityCharacter={isCompatibilityCharacter}
      bot={bot}
      disableExternalLinks={disableExternalLinks}
      lang={lang}
      linkMode="server"
      langPrefix={langPrefix}
    />
  )
}
