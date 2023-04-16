import { ReactElement } from 'react'
import './styles.css'
import { getApiUrl } from '@/_config'

interface IdsFindResponseParams {
  ids: string[]
  whole: string[]
}
export default async function IdsFindResponse(
  params: IdsFindResponseParams,
): Promise<ReactElement> {
  const { ids, whole } = params
  const url = new URL(getApiUrl('/api/v1/idsfind'))
  ids.forEach((value) => url.searchParams.append('ids', value))
  whole.forEach((value) => url.searchParams.append('whole', value))
  const res = await fetch(url, {
    next: {
      revalidate: 10 * 60,
    },
  })
  if (!res.ok) {
    const { message } = await res.json()
    throw new Error(message)
  }
  const responseBody = await res.json()
  const { results } = responseBody
  return (
    <div className="ids-find-response">
      {results.map((char: string) => {
        return (
          <div className="ids-find-result-char" key={char}>
            {char}
          </div>
        )
      })}
    </div>
  )
}