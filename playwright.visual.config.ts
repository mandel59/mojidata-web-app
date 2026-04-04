import { defineConfig, devices } from '@playwright/test'

const visualServerPort = process.env.VISUAL_SERVER_PORT ?? '3300'
const visualTargetUrl =
  process.env.VISUAL_TARGET_URL ?? `http://127.0.0.1:${visualServerPort}`
const useLocalVisualServer = (() => {
  try {
    return new URL(visualTargetUrl).origin === `http://127.0.0.1:${visualServerPort}`
  } catch {
    return false
  }
})()

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  workers: 1,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: visualTargetUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '*-visual.spec.ts',
      testIgnore: 'storybook-visual.spec.ts',
    },
  ],
  webServer: useLocalVisualServer
    ? {
        command: `npm run dev -- --port ${visualServerPort}`,
        url: `http://127.0.0.1:${visualServerPort}`,
        env: {
          BOT_DELAY_DISABLE: '1',
        },
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
})
