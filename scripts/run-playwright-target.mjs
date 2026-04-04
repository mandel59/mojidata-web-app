#!/usr/bin/env node

import { spawn } from 'node:child_process'

const DEFAULT_PORT = 3310

function printUsageAndExit(message) {
  if (message) {
    console.error(message)
    console.error('')
  }
  console.error(
    [
      'Usage:',
      "  node scripts/run-playwright-target.mjs [--port 3310] [--base-url http://127.0.0.1:3310] -- 'tests/e2e/mojidata.spec.ts' --project=chromium",
    ].join('\n'),
  )
  process.exit(1)
}

function parseArgs(argv) {
  let port = DEFAULT_PORT
  let baseUrl = null
  const forwardedArgs = []

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--') {
      forwardedArgs.push(...argv.slice(i + 1))
      break
    }
    if (arg === '--port') {
      const value = argv[i + 1]
      if (value == null) {
        printUsageAndExit('Missing value for --port')
      }
      const parsed = Number.parseInt(value, 10)
      if (!Number.isInteger(parsed) || parsed <= 0) {
        printUsageAndExit(`Invalid port: ${value}`)
      }
      port = parsed
      i += 1
      continue
    }
    if (arg === '--base-url') {
      const value = argv[i + 1]
      if (value == null) {
        printUsageAndExit('Missing value for --base-url')
      }
      baseUrl = value
      i += 1
      continue
    }
    printUsageAndExit(`Unknown argument: ${arg}`)
  }

  if (forwardedArgs.length === 0) {
    printUsageAndExit('Missing Playwright arguments after --')
  }

  return {
    port,
    baseUrl: baseUrl ?? `http://127.0.0.1:${port}`,
    forwardedArgs,
  }
}

const { port, baseUrl, forwardedArgs } = parseArgs(process.argv.slice(2))

console.error(
  [
    `Running Playwright target on ${baseUrl}`,
    `Forwarded args: ${forwardedArgs.join(' ')}`,
  ].join('\n'),
)

const child = spawn(
  'npx',
  ['playwright', 'test', ...forwardedArgs],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      PLAYWRIGHT_TEST_SERVER_PORT: String(port),
      PLAYWRIGHT_TEST_BASE_URL: baseUrl,
    },
  },
)

const exitCode = await new Promise((resolve, reject) => {
  child.on('error', reject)
  child.on('close', resolve)
})

process.exit(exitCode ?? 1)
