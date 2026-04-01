import { chromium } from 'playwright'

const urls = {
  current: 'http://127.0.0.1:3000/ja-JP/mojidata/%E6%BC%A2',
  baseline: 'http://127.0.0.1:3002/ja-JP/mojidata/%E6%BC%A2',
}

async function capture(url) {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
  })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle')
  await page
    .locator('[data-testid="mojidata-summary-wrap"], .mojidata-summary-wrap')
    .first()
    .waitFor({ state: 'visible', timeout: 30000 })
  await page.evaluate(async () => {
    if ('fonts' in document) await document.fonts.ready
  })
  await page.waitForTimeout(400)

  const result = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('article h2, article h3'))
      .map((node) => {
        const rect = node.getBoundingClientRect()
        return {
          tag: node.tagName.toLowerCase(),
          id: node.id,
          text: node.textContent?.trim() ?? '',
          y: Math.round(rect.y * 100) / 100,
          height: Math.round(rect.height * 100) / 100,
        }
      })
    const article = document.querySelector('article')
    const articleRect = article?.getBoundingClientRect()
    return {
      articleHeight: articleRect ? Math.round(articleRect.height * 100) / 100 : null,
      headings,
    }
  })

  await context.close()
  await browser.close()
  return result
}

const current = await capture(urls.current)
const baseline = await capture(urls.baseline)

console.log(JSON.stringify({ current, baseline }, null, 2))
