import fs from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium, devices, expect, firefox } from '@playwright/test'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(rootDir, 'dist', 'crawl-spa')

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.wasm', 'application/wasm'],
])

async function serveFile(res, filePath) {
  const data = await fs.readFile(filePath)
  res.writeHead(200, {
    'Content-Type':
      contentTypes.get(path.extname(filePath)) ??
      'application/octet-stream',
  })
  res.end(data)
}

async function resolveFilePath(requestUrl) {
  const url = new URL(requestUrl ?? '/', 'http://127.0.0.1')
  const filePath = path.resolve(outDir, `.${url.pathname}`)
  if (filePath !== outDir && !filePath.startsWith(`${outDir}${path.sep}`)) {
    return undefined
  }

  try {
    const stat = await fs.stat(filePath)
    if (stat.isFile()) return filePath
  } catch {
    // Fall through to SPA fallback.
  }

  return path.join(outDir, 'index.html')
}

async function startStaticServer() {
  const server = http.createServer((req, res) => {
    void (async () => {
      try {
        const filePath = await resolveFilePath(req.url)
        if (!filePath) {
          res.writeHead(403)
          res.end('Forbidden')
          return
        }
        await serveFile(res, filePath)
      } catch (error) {
        res.writeHead(500)
        res.end(error instanceof Error ? error.message : String(error))
      }
    })()
  })

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind static server.')
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  }
}

async function verifySearchToDetail(page, baseUrl, label) {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  await page.goto(`${baseUrl}/search?query=%E6%BC%A2`, {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.locator('link[rel="stylesheet"]')).toHaveAttribute(
    'href',
    /\/assets\/main-[A-Z0-9]+\.css$/,
  )
  const headerBorderStyle = await page.locator('header').evaluate((element) => {
    return window.getComputedStyle(element).borderTopStyle
  })
  if (headerBorderStyle === 'none') {
    throw new Error(`${label} stylesheet did not apply to the site header.`)
  }

  const firstResult = page.locator('article a[href*="/mojidata/"]').first()
  try {
    await expect(firstResult).toBeVisible({
      timeout: 60_000,
    })
  } catch (error) {
    const bodyText = await page.locator('body').innerText({ timeout: 1_000 })
    throw new Error(
      [
        `${label} search results were not visible.`,
        errors.length > 0 ? `Browser errors:\n${errors.join('\n')}` : '',
        `Body text:\n${bodyText}`,
        error instanceof Error ? error.message : String(error),
      ]
        .filter(Boolean)
        .join('\n\n'),
    )
  }

  await firstResult.click()
  await expect(page.locator('[data-spa="mojidata"]')).toBeVisible({
    timeout: 60_000,
  })
  await expect(page.getByTestId('mojidata-response')).toHaveCount(1, {
    timeout: 60_000,
  })
  await expect(
    page.getByTestId('mojidata-response').locator('figure').first().locator('figcaption'),
  ).toContainText('U+', { timeout: 60_000 })

  if (errors.length > 0) {
    throw new Error(`${label} browser errors:\n${errors.join('\n')}`)
  }
}

async function verifyFirefoxMojidataDbCache(baseUrl) {
  const profileDir = await fs.mkdtemp(
    path.join(os.tmpdir(), 'mojidata-firefox-cache-'),
  )
  const context = await firefox.launchPersistentContext(profileDir, {
    headless: true,
  })

  async function collectResponses(label) {
    const page = await context.newPage()
    const responses = []
    page.on('response', async (response) => {
      const responseUrl = response.url()
      if (!responseUrl.includes('/assets/moji.db')) return
      const headers = await response.allHeaders()
      responses.push({
        url: responseUrl,
        status: response.status(),
        date: headers.date,
        cfRay: headers['cf-ray'],
        contentEncoding: headers['content-encoding'],
        contentLength: headers['content-length'],
      })
    })

    await page.goto(`${baseUrl}/mojidata/%E8%90%8C`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.getByTestId('mojidata-response')).toHaveCount(1, {
      timeout: 60_000,
    })
    await page.close()
    return { label, responses }
  }

  try {
    const first = await collectResponses('first')
    const second = await collectResponses('second')
    const firstDb = first.responses.find((response) =>
      response.url.includes('/assets/moji.db.br'),
    )
    const secondDb = second.responses.find((response) =>
      response.url.includes('/assets/moji.db.br'),
    )

    if (!firstDb || !secondDb) {
      throw new Error(
        `Firefox did not load the Brotli mojidata DB asset:\n${JSON.stringify(
          { first, second },
          null,
          2,
        )}`,
      )
    }
    if (firstDb.date !== secondDb.date || firstDb.cfRay !== secondDb.cfRay) {
      throw new Error(
        `Firefox mojidata DB asset was not reused from HTTP cache:\n${JSON.stringify(
          { first, second },
          null,
          2,
        )}`,
      )
    }
  } finally {
    await context.close()
    await fs.rm(profileDir, { recursive: true, force: true })
  }
}

const remoteBaseUrl = process.env.MOJIDATA_CRAWL_SPA_VERIFY_BASE_URL
const server = remoteBaseUrl
  ? { baseUrl: remoteBaseUrl.replace(/\/+$/, ''), close: async () => {} }
  : await startStaticServer()
const browser = await chromium.launch()

try {
  const desktop = await browser.newPage()
  await verifySearchToDetail(desktop, server.baseUrl, 'desktop')
  await desktop.close()

  const mobileContext = await browser.newContext(devices['iPhone 13'])
  const mobile = await mobileContext.newPage()
  await verifySearchToDetail(mobile, server.baseUrl, 'mobile')
  await mobileContext.close()

  if (process.env.MOJIDATA_CRAWL_SPA_VERIFY_FIREFOX_CACHE === '1') {
    await verifyFirefoxMojidataDbCache(server.baseUrl)
    console.log('[crawl-spa] verified Firefox mojidata DB HTTP cache reuse')
  }

  console.log(`[crawl-spa] verified desktop and mobile at ${server.baseUrl}`)
} finally {
  await browser.close()
  await server.close()
}
