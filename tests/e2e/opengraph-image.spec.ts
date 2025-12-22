import { expect, test } from '@playwright/test'

const BOT_UA =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

function extractMeta(html: string, property: string) {
  const re = new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    'i',
  )
  return html.match(re)?.[1] ?? null
}

function toLocalUrl(url: string, baseURL: string) {
  const localBase = new URL(baseURL)
  const u = new URL(url, baseURL)
  u.protocol = localBase.protocol
  u.host = localBase.host
  return u.toString()
}

test('bot sees og:image on mojidata page and can fetch it', async ({ request, baseURL }) => {
  expect(baseURL).toBeTruthy()

  const pageRes = await request.get('/ja-JP/mojidata/%E6%BC%A2', {
    headers: {
      'User-Agent': BOT_UA,
    },
  })
  expect(pageRes.status()).toBe(200)

  const html = await pageRes.text()
  const ogImage = extractMeta(html, 'og:image')
  expect(ogImage).toBeTruthy()
  expect(ogImage).toMatch(/\/api\/mojidata\/%E6%BC%A2\/opengraph-image\b/)

  const imgRes = await request.get(toLocalUrl(ogImage!, baseURL!), {
    headers: {
      'User-Agent': BOT_UA,
    },
  })
  expect(imgRes.status()).toBe(200)
  expect(imgRes.headers()['content-type']).toMatch(/^image\/png\b/)

  const body = await imgRes.body()
  expect(body.byteLength).toBeGreaterThan(1000)
})

test('bot can fetch mojidata opengraph-image', async ({ request }) => {
  const res = await request.get('/api/mojidata/%E6%BC%A2/opengraph-image', {
    headers: {
      'User-Agent': BOT_UA,
    },
  })

  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toMatch(/^image\/png\b/)

  const body = await res.body()
  expect(body.byteLength).toBeGreaterThan(1000)
})
