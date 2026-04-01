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

  const data = await page.evaluate(() => {
    const regionalHeading = document.getElementById('Regional_Differences')
    const section = regionalHeading?.nextElementSibling
    const toRect = (node) => {
      if (!node) return null
      const rect = node.getBoundingClientRect()
      return {
        x: Math.round(rect.x * 100) / 100,
        y: Math.round(rect.y * 100) / 100,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100,
      }
    }
    return {
      heading: toRect(regionalHeading),
      section: {
        rect: toRect(section),
        children: Array.from(section?.children ?? []).map((child) => ({
          tag: child.tagName.toLowerCase(),
          className: child.className,
          rect: toRect(child),
        })),
      },
    }
  })

  await context.close()
  await browser.close()
  return data
}

console.log(
  JSON.stringify(
    {
      current: await capture(urls.current),
      baseline: await capture(urls.baseline),
    },
    null,
    2,
  ),
)
