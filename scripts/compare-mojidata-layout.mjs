import { chromium } from 'playwright'

const targets = [
  {
    name: 'current-desktop',
    url: 'http://127.0.0.1:3000/ja-JP/mojidata/%E6%BC%A2',
    viewport: { width: 1440, height: 1200 },
  },
  {
    name: 'baseline-desktop',
    url: 'http://127.0.0.1:3002/ja-JP/mojidata/%E6%BC%A2',
    viewport: { width: 1440, height: 1200 },
  },
  {
    name: 'current-mobile',
    url: 'http://127.0.0.1:3000/ja-JP/mojidata/%E6%BC%A2',
    viewport: { width: 390, height: 844 },
    isMobile: true,
  },
  {
    name: 'baseline-mobile',
    url: 'http://127.0.0.1:3002/ja-JP/mojidata/%E6%BC%A2',
    viewport: { width: 390, height: 844 },
    isMobile: true,
  },
]

function roundRect(rect) {
  if (!rect) return null
  return Object.fromEntries(
    Object.entries(rect).map(([key, value]) => [
      key,
      Math.round(value * 100) / 100,
    ]),
  )
}

for (const target of targets) {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: target.viewport,
    isMobile: target.isMobile ?? false,
  })
  const page = await context.newPage()
  await page.goto(target.url, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle')
  await page.evaluate(async () => {
    if ('fonts' in document) await document.fonts.ready
  })
  await page.waitForTimeout(400)

  const metrics = await page.evaluate(() => {
    const queryRect = (selector) => {
      const element = document.querySelector(selector)
      if (!element) return null
      const rect = element.getBoundingClientRect()
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      }
    }

    const summary =
      queryRect('[data-testid="mojidata-summary-wrap"]') ??
      queryRect('.mojidata-summary-wrap')

    return {
      header: queryRect('header'),
      article: queryRect('article'),
      summary,
      preview: queryRect('[role="status"][aria-live="polite"]'),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    }
  })

  console.log(
    JSON.stringify(
      {
        name: target.name,
        ...Object.fromEntries(
          Object.entries(metrics).map(([key, value]) => [key, roundRect(value)]),
        ),
      },
      null,
      2,
    ),
  )

  await context.close()
  await browser.close()
}
