import { expect, test } from '@playwright/test'

async function warmGet(
  request: Parameters<typeof test>[2]['request'],
  url: string,
  opts?: { headers?: Record<string, string> },
) {
  let lastStatus: number | null = null
  let lastBody: string | null = null
  for (let i = 0; i < 30; i++) {
    const res = await request.get(url, opts)
    lastStatus = res.status()
    if (lastStatus >= 200 && lastStatus < 300) return
    lastBody = await res.text().catch(() => null)
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(
    `warmGet failed: ${url} (status=${lastStatus})\n${lastBody ?? ''}`,
  )
}

test('warm up next dev routes', async ({ request }) => {
  await warmGet(request, '/ja-JP/search')
  await warmGet(request, '/ja-JP/idsfind')
  await warmGet(request, '/ja-JP/mojidata/%E6%BC%A2')
  await warmGet(request, '/ja-JP/search-spa')
  await warmGet(request, '/ja-JP/idsfind-spa')
  await warmGet(request, '/ja-JP/mojidata-spa/%E6%BC%A2')
  await warmGet(request, '/api/mojidata/%E6%BC%A2/opengraph-image')

  await warmGet(request, '/assets/sql-wasm.wasm', {
    headers: { Range: 'bytes=0-64' },
  })
  await warmGet(request, '/assets/idsfind.db', {
    headers: { Range: 'bytes=0-64' },
  })
  await warmGet(request, '/assets/moji.db', {
    headers: { Range: 'bytes=0-64' },
  })

  expect(true).toBeTruthy()
})

