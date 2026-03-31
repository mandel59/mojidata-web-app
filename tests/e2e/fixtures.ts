import { expect, test as base, type Page } from '@playwright/test'

interface BrowserErrorRecord {
  kind: 'console.error' | 'pageerror'
  message: string
}

function formatBrowserErrors(errors: BrowserErrorRecord[]) {
  return errors.map((error) => `[${error.kind}] ${error.message}`).join('\n')
}

export function attachBrowserErrorChecks(page: Page) {
  const errors: BrowserErrorRecord[] = []

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    errors.push({
      kind: 'console.error',
      message: msg.text(),
    })
  })

  page.on('pageerror', (error) => {
    errors.push({
      kind: 'pageerror',
      message: error.stack ?? error.message,
    })
  })

  return () => {
    expect(
      errors,
      errors.length === 0 ? undefined : formatBrowserErrors(errors),
    ).toEqual([])
  }
}

export const test = base.extend<{ page: Page }>({
  page: async ({ page }, runFixture) => {
    const assertNoBrowserErrors = attachBrowserErrorChecks(page)
    await runFixture(page)
    assertNoBrowserErrors()
  },
})

export { expect }
