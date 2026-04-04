import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'

const DESKTOP_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

async function gotoVisual(page: Page, path: string) {
  await page.goto(path, {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForLoadState('networkidle')
  await page.evaluate(async () => {
    if ('fonts' in document) {
      await document.fonts.ready
    }
  })
  await page.waitForTimeout(300)
}

async function waitForVisibleImages(page: Page) {
  await page.waitForFunction(() => {
    const images = Array.from(document.images).filter((image) => {
      const rect = image.getBoundingClientRect()
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight
      )
    })
    return images.every((image) => image.complete && image.naturalWidth > 0)
  })
}

async function getTopArticleClip(page: Page, bottomInset = 16) {
  return page.evaluate((inset) => {
    const article = document.querySelector('article:last-of-type')
    if (!(article instanceof HTMLElement)) return null
    const rect = article.getBoundingClientRect()
    const left = Math.max(0, rect.left)
    const top = Math.max(0, rect.top)
    const width = Math.min(rect.width, window.innerWidth - left)
    const height = Math.min(rect.height, window.innerHeight - top - inset)
    if (width <= 0 || height <= 0) return null
    return {
      x: Math.round(left * 100) / 100,
      y: Math.round(top * 100) / 100,
      width: Math.round(width * 100) / 100,
      height: Math.round(height * 100) / 100,
    }
  }, bottomInset)
}

async function prepareSectionScreenshotTarget(
  page: Page,
  targetId: string,
  startId: string,
  endId?: string,
) {
  const attached = await page.evaluate(
    ({ targetId, startId, endId }) => {
      function findCommonAncestor(
        start: HTMLElement,
        end: HTMLElement | null,
      ): HTMLElement | null {
        if (end == null) {
          return start.parentElement
        }

        let current: HTMLElement | null = start
        while (current != null) {
          if (current.contains(end)) {
            return current
          }
          current = current.parentElement
        }
        return null
      }

      function findDirectChild(
        root: HTMLElement,
        node: HTMLElement,
      ): Node | null {
        let current: Node | null = node
        while (current != null && current.parentNode !== root) {
          current = current.parentNode
        }
        return current
      }

      document
        .querySelectorAll(`[data-visual-target="${targetId}"]`)
        .forEach((node) => {
          if (!(node instanceof HTMLElement)) return
          while (node.firstChild) {
            node.parentNode?.insertBefore(node.firstChild, node)
          }
          node.remove()
        })

      const start = document.getElementById(startId)
      if (!(start instanceof HTMLElement)) return false

      const end =
        endId == null ? null : document.getElementById(endId)
      if (endId != null && !(end instanceof HTMLElement)) return false

      const root = findCommonAncestor(start, end)
      if (!(root instanceof HTMLElement)) return false

      const startBlock = findDirectChild(root, start)
      if (startBlock == null) return false

      const endBlock =
        end == null ? null : findDirectChild(root, end)
      if (end != null && endBlock == null) return false

      const wrapper = document.createElement('div')
      wrapper.dataset.visualTarget = targetId
      wrapper.style.display = 'block'
      wrapper.style.width = '100%'

      root.insertBefore(wrapper, startBlock)

      let current: Node | null = startBlock
      while (current != null && current !== endBlock) {
        const next: Node | null = current.nextSibling
        wrapper.appendChild(current)
        current = next
      }

      return wrapper.childNodes.length > 0
    },
    { targetId, startId, endId },
  )

  expect(attached).toBeTruthy()
}

async function expectStablePageScreenshot(
  page: Page,
  name: string,
  clip: { x: number; y: number; width: number; height: number },
) {
  await waitForVisibleImages(page)
  await expect(page).toHaveScreenshot(name, {
    animations: 'disabled',
    caret: 'hide',
    clip,
    maxDiffPixelRatio: 0.001,
  })
}

async function expectStableLocatorScreenshot(
  page: Page,
  locator: Locator,
  name: string,
) {
  await waitForVisibleImages(page)
  await expect(locator).toHaveScreenshot(name, {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.001,
  })
}

test('desktop mojidata top view matches baseline', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: DESKTOP_UA,
    viewport: { width: 1440, height: 1200 },
  })
  const page = await context.newPage()

  await gotoVisual(page, '/ja-JP/mojidata/%E6%BC%A2')
  await expectStableLocatorScreenshot(
    page,
    page.locator('article').last(),
    'desktop-mojidata-top.png',
  )

  await context.close()
})

test('desktop mojidata moji_joho matches baseline', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: DESKTOP_UA,
    viewport: { width: 1440, height: 1200 },
  })
  const page = await context.newPage()

  await gotoVisual(page, '/ja-JP/mojidata/%E6%BC%A2?mojiJohoImage=1')
  await page.waitForSelector('#Moji_Joho')
  await prepareSectionScreenshotTarget(
    page,
    'desktop-mojijoho-range',
    'Moji_Joho',
    'Variants',
  )
  await page
    .locator('[data-visual-target="desktop-mojijoho-range"]')
    .scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await expectStableLocatorScreenshot(
    page,
    page.locator('[data-visual-target="desktop-mojijoho-range"]'),
    'desktop-mojidata-mojijoho.png',
  )

  await context.close()
})

test('mobile mojidata top view matches baseline', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: MOBILE_UA,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()

  await gotoVisual(page, '/ja-JP/mojidata/%E6%BC%A2')
  const clip = await getTopArticleClip(page)
  expect(clip).not.toBeNull()
  await expectStablePageScreenshot(page, 'mobile-mojidata-top.png', clip!)

  await context.close()
})

test('mobile mojidata variants view matches baseline', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: MOBILE_UA,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()

  await gotoVisual(page, '/ja-JP/mojidata/%E6%B0%B4')
  await page.waitForSelector('#Variants')
  await page
    .locator('#Variants + div')
    .scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await expectStableLocatorScreenshot(
    page,
    page.locator('#Variants + div'),
    'mobile-mojidata-variants.png',
  )

  await context.close()
})
