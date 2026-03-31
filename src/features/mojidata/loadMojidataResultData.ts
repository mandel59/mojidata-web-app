import type { MojidataResults } from '@/mojidata/mojidataShared'

export async function loadMojidataResultData(
  fetcher: (char: string) => Promise<MojidataResults>,
  ucs: string,
) {
  const results = await fetcher(ucs)

  const cjkci = results.svs_cjkci.map((record) => record.CJKCI_char)
  const isCompatibilityCharacter =
    results.svs_cjkci.length > 0 && cjkci[0] === ucs
  const canonicalCharacter = isCompatibilityCharacter
    ? await fetcher([...results.svs_cjkci[0].SVS_char][0])
    : results
  const compatibilityCharacters = !isCompatibilityCharacter
    ? await Promise.all(cjkci.map((char) => fetcher(char)))
    : undefined

  return {
    results,
    canonicalCharacter,
    compatibilityCharacters,
    isCompatibilityCharacter,
  }
}
