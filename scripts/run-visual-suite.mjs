#!/usr/bin/env node

import { spawn } from 'node:child_process'

const DEFAULT_COMPARE_URL = 'http://127.0.0.1:3000'
const DEFAULT_BASELINE_URL = 'http://127.0.0.1:3002'

function parseArgs(argv) {
  const [mode, ...rest] = argv
  if (mode !== 'compare' && mode !== 'refresh-baseline') {
    printUsageAndExit()
  }

  let targetUrl =
    mode === 'compare' ? DEFAULT_COMPARE_URL : DEFAULT_BASELINE_URL

  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i]
    if (arg === '--target-url') {
      const value = rest[i + 1]
      if (value == null) {
        printUsageAndExit('Missing value for --target-url')
      }
      targetUrl = value
      i += 1
      continue
    }
    printUsageAndExit(`Unknown argument: ${arg}`)
  }

  return { mode, targetUrl }
}

function printUsageAndExit(message) {
  if (message) {
    console.error(message)
    console.error('')
  }
  console.error(
    [
      'Usage:',
      '  node scripts/run-visual-suite.mjs compare [--target-url http://127.0.0.1:3000]',
      '  node scripts/run-visual-suite.mjs refresh-baseline [--target-url http://127.0.0.1:3002]',
    ].join('\n'),
  )
  process.exit(1)
}

async function ensureReachable(targetUrl) {
  try {
    const response = await fetch(targetUrl, { redirect: 'manual' })
    return response.ok || (response.status >= 300 && response.status < 400)
  } catch {
    return false
  }
}

function printFailureHint(output, targetUrl) {
  const failureChecks = [
    {
      label: 'Visual target is not reachable',
      match:
        output.includes('ERR_CONNECTION_REFUSED') ||
        output.includes('ECONNREFUSED'),
      details: `Start the app serving ${targetUrl} first, or pass a reachable --target-url.`,
    },
    {
      label: 'Playwright web server failed to start',
      match:
        output.includes('EADDRINUSE') ||
        output.includes('Timed out waiting') ||
        output.includes('listen EPERM'),
      details:
        'Another process may already be using the expected port, the sandbox may block binding the port, or the dev server did not become ready in time.',
    },
    {
      label: 'Chromium could not launch',
      match:
        output.includes('browserType.launch') ||
        output.includes('MachPortRendezvousServer') ||
        output.includes('Permission denied (1100)'),
      details:
        'This is an environment/browser launch issue rather than a visual mismatch.',
    },
    {
      label: 'Visual mismatch detected',
      match:
        output.includes('toHaveScreenshot') ||
        output.includes('Screenshot comparison failed') ||
        output.includes('diff pixels'),
      details:
        'The app rendered, but the current screenshots differ from the saved baseline snapshots.',
    },
  ]

  const matched = failureChecks.find((check) => check.match)
  if (matched == null) {
    console.error('\nVisual run failed for an unclassified reason.')
    return
  }

  console.error(`\nFailure summary: ${matched.label}`)
  console.error(matched.details)
}

async function runVisualSuite({ mode, targetUrl }) {
  if (mode === 'refresh-baseline') {
    const reachable = await ensureReachable(targetUrl)
    if (!reachable) {
      console.error(`Baseline target is not reachable: ${targetUrl}`)
      console.error(
        'Start the baseline workspace server first, or pass a reachable --target-url.',
      )
      process.exit(1)
    }
  }

  const args = ['playwright', 'test', '-c', 'playwright.visual.config.ts']
  if (mode === 'refresh-baseline') {
    args.push('--update-snapshots')
  }

  const env = {
    ...process.env,
    VISUAL_TARGET_URL: targetUrl,
  }

  console.error(
    [
      `Running visual suite in ${mode} mode.`,
      `Target URL: ${targetUrl}`,
      mode === 'compare'
        ? 'Local current runs auto-start the app when target-url is 127.0.0.1:3000.'
        : 'Baseline mode expects the target app to already be running.',
    ].join('\n'),
  )

  const child = spawn('npx', args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    env,
  })

  let captured = ''

  child.stdout.on('data', (chunk) => {
    const text = chunk.toString()
    captured += text
    process.stdout.write(text)
  })

  child.stderr.on('data', (chunk) => {
    const text = chunk.toString()
    captured += text
    process.stderr.write(text)
  })

  const exitCode = await new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('close', resolve)
  })

  if (exitCode === 0) {
    console.error(
      `\nVisual suite passed (${mode === 'compare' ? 'current compare' : 'baseline refresh'}).`,
    )
    return
  }

  printFailureHint(captured, targetUrl)
  process.exit(exitCode ?? 1)
}

await runVisualSuite(parseArgs(process.argv.slice(2)))
