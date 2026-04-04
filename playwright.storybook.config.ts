import { defineConfig, devices } from '@playwright/test'

const storybookBaseUrl =
  process.env.STORYBOOK_BASE_URL ?? 'http://127.0.0.1:6006'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: storybookBaseUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'storybook-*.spec.ts',
    },
  ],
})
