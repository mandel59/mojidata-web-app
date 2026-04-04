import { defineConfig, devices } from '@playwright/test'

const visualTargetUrl =
  process.env.VISUAL_TARGET_URL ?? 'http://127.0.0.1:3000'
const useLocalVisualServer = (() => {
  try {
    return new URL(visualTargetUrl).origin === 'http://127.0.0.1:3000'
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
    },
  ],
  webServer: useLocalVisualServer
    ? {
        command: 'npm run dev -- --port 3000',
        url: 'http://127.0.0.1:3000',
        env: {
          BOT_DELAY_DISABLE: '1',
        },
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
})
