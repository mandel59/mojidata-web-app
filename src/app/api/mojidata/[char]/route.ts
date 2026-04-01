import { getRevalidateDuration } from '@/app/config'
import { fetchMojidataServer } from '@/features/mojidata/fetchMojidataServer'

export const runtime = 'nodejs'
export const revalidate = 86400

function cacheControl() {
  const revalidateSeconds = getRevalidateDuration()
  if (process.env.NODE_ENV === 'development') {
    return 'no-cache, no-store'
  }
  const staleSeconds = 7 * revalidateSeconds
  return `public, max-age=0, s-maxage=${revalidateSeconds}, must-revalidate, stale-while-revalidate=${staleSeconds}`
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ char: string }> },
) {
  const char = (await context.params).char.replace(/%25/g, '%')
  const ucs = String.fromCodePoint(decodeURIComponent(char).codePointAt(0) ?? 0)

  if (ucs <= '\x7f') {
    return Response.json({ error: 'Not Found' }, { status: 404 })
  }

  const results = await fetchMojidataServer(ucs)

  return Response.json(
    { results },
    {
      headers: {
        'Cache-Control': cacheControl(),
      },
    },
  )
}
