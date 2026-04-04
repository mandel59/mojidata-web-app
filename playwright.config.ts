import { defineConfig, devices } from '@playwright/test'

const playwrightServerPort =
  process.env.PLAYWRIGHT_TEST_SERVER_PORT ?? '3000'
const playwrightBaseUrl =
  process.env.PLAYWRIGHT_TEST_BASE_URL ??
  `http://127.0.0.1:${playwrightServerPort}`

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: playwrightBaseUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: 'setup.spec.ts',
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: 'setup.spec.ts',
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
      testIgnore: 'setup.spec.ts',
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${playwrightServerPort}`,
    url: playwrightBaseUrl,
    env: {
      BOT_DELAY_DISABLE: '1',
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
