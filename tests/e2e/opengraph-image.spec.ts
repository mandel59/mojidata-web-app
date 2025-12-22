import { expect, test } from '@playwright/test'

const BOT_UA =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

const LIKELY_BOT_UA =
  'Mozilla/5.0 (compatible; ExampleCrawler/1.0; +https://example.com/crawler)'

const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

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

test('disableExternalLinks bots do not advertise og:image', async ({ request }) => {
  const pageRes = await request.get('/ja-JP/mojidata/%E6%BC%A2', {
    headers: {
      'User-Agent': LIKELY_BOT_UA,
    },
  })
  expect(pageRes.status()).toBe(200)

  const html = await pageRes.text()
  expect(extractMeta(html, 'og:image')).toBeNull()
})

test('server mojidata page advertises shared og:image and it is fetchable', async ({
  request,
  baseURL,
}) => {
  expect(baseURL).toBeTruthy()

  const pageRes = await request.get('/ja-JP/mojidata/%E6%BC%A2', {
    headers: {
      'User-Agent': MOBILE_UA,
    },
  })
  expect(pageRes.status()).toBe(200)

  const html = await pageRes.text()
  const ogImage = extractMeta(html, 'og:image')
  expect(ogImage).toBeTruthy()
  expect(ogImage).toMatch(/\/api\/mojidata\/%E6%BC%A2\/opengraph-image\b/)

  const imgRes = await request.get(toLocalUrl(ogImage!, baseURL!), {
    headers: {
      'User-Agent': MOBILE_UA,
    },
  })
  expect(imgRes.status()).toBe(200)
  expect(imgRes.headers()['content-type']).toMatch(/^image\/png\b/)
  expect((await imgRes.body()).byteLength).toBeGreaterThan(1000)
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

test('legacy /[lang]/mojidata/[char]/opengraph-image is served via API', async ({
  request,
}) => {
  const res = await request.get('/ja-JP/mojidata/%E6%BC%A2/opengraph-image', {
    headers: {
      'User-Agent': BOT_UA,
    },
  })

  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toMatch(/^image\/png\b/)
  expect((await res.body()).byteLength).toBeGreaterThan(1000)
})
