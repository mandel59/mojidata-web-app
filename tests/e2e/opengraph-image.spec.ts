import { expect, test } from '@playwright/test'

const BOT_UA =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

test('bot can fetch mojidata opengraph-image', async ({ request }) => {
  const res = await request.get('/ja-JP/mojidata/%E6%BC%A2/opengraph-image', {
    headers: {
      'User-Agent': BOT_UA,
    },
  })

  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toMatch(/^image\/png\b/)

  const body = await res.body()
  expect(body.byteLength).toBeGreaterThan(1000)
})

