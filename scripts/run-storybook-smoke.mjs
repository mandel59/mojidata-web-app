#!/usr/bin/env node

import { spawn } from 'node:child_process'
import net from 'node:net'

const DEFAULT_PORT = 6006
const DEFAULT_HOST = '127.0.0.1'

function printUsageAndExit(message) {
  if (message) {
    console.error(message)
    console.error('')
  }
  console.error(
    [
      'Usage:',
      '  node scripts/run-storybook-smoke.mjs [--port 6006] [--host 127.0.0.1] [--config playwright.storybook.config.ts] [--spec tests/e2e/storybook-smoke.spec.ts] [--update-snapshots]',
    ].join('\n'),
  )
  process.exit(1)
}

function parseArgs(argv) {
  let preferredPort = DEFAULT_PORT
  let host = DEFAULT_HOST
  let config = 'playwright.storybook.config.ts'
  let spec = 'tests/e2e/storybook-smoke.spec.ts'
  let updateSnapshots = false

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--port') {
      const value = argv[i + 1]
      if (value == null) printUsageAndExit('Missing value for --port')
      const parsed = Number.parseInt(value, 10)
      if (!Number.isInteger(parsed) || parsed <= 0) {
        printUsageAndExit(`Invalid port: ${value}`)
      }
      preferredPort = parsed
      i += 1
      continue
    }
    if (arg === '--host') {
      const value = argv[i + 1]
      if (value == null) printUsageAndExit('Missing value for --host')
      host = value
      i += 1
      continue
    }
    if (arg === '--spec') {
      const value = argv[i + 1]
      if (value == null) printUsageAndExit('Missing value for --spec')
      spec = value
      i += 1
      continue
    }
    if (arg === '--config') {
      const value = argv[i + 1]
      if (value == null) printUsageAndExit('Missing value for --config')
      config = value
      i += 1
      continue
    }
    if (arg === '--update-snapshots') {
      updateSnapshots = true
      continue
    }
    printUsageAndExit(`Unknown argument: ${arg}`)
  }

  return { preferredPort, host, config, spec, updateSnapshots }
}

function findAvailablePort(host, startingPort, attempts = 20) {
  return new Promise((resolve, reject) => {
    let candidate = startingPort
    let lastError = null

    const tryListen = () => {
      if (candidate >= startingPort + attempts) {
        reject(
          new Error(
            lastError == null
              ? `Could not find an available port from ${startingPort} to ${
                  startingPort + attempts - 1
                }`
              : `Could not find an available port from ${startingPort} to ${
                  startingPort + attempts - 1
                }: ${lastError.code ?? 'ERROR'} ${lastError.message}`,
          ),
        )
        return
      }

      const probe = net.createServer()

      probe.once('error', (error) => {
        lastError = error
        if (error.code === 'EPERM' || error.code === 'EACCES') {
          reject(
            new Error(`${error.code} ${error.message}`),
          )
          return
        }
        probe.close(() => {
          candidate += 1
          tryListen()
        })
      })

      probe.listen(candidate, host, () => {
        const { port } = probe.address()
        probe.close((closeError) => {
          if (closeError) {
            reject(closeError)
            return
          }
          resolve(port)
        })
      })
    }

    tryListen()
  })
}

async function waitForReachable(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: 'manual' })
      if (response.ok || (response.status >= 300 && response.status < 500)) {
        return true
      }
    } catch {
      // wait and retry
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000))
  }
  return false
}

function classifyFailure(output) {
  const failureChecks = [
    {
      label: 'Storybook server failed to start',
      match:
        output.includes('EADDRINUSE') ||
        output.includes('listen EPERM') ||
        output.includes('timed out waiting') ||
        output.includes('Timed out waiting'),
      details:
        'Another process may already be using the port, the sandbox may block the bind, or Storybook never became ready.',
    },
    {
      label: 'Storybook target is not reachable',
      match:
        output.includes('ERR_CONNECTION_REFUSED') ||
        output.includes('ECONNREFUSED'),
      details:
        'The Storybook server did not become reachable at the expected base URL.',
    },
    {
      label: 'Chromium could not launch',
      match:
        output.includes('browserType.launch') ||
        output.includes('MachPortRendezvousServer') ||
        output.includes('Permission denied (1100)'),
      details:
        'This is a browser launch/environment issue rather than a Storybook rendering mismatch.',
    },
  ]
  return failureChecks.find((check) => check.match) ?? null
}

async function run() {
  const { preferredPort, host, config, spec, updateSnapshots } = parseArgs(
    process.argv.slice(2),
  )
  let port
  try {
    port = await findAvailablePort(host, preferredPort)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown port selection failure'
    console.error(
      `Could not secure a Storybook port near ${preferredPort}: ${message}`,
    )
    if (message.includes('EPERM') || message.includes('operation not permitted')) {
      console.error(
        'Failure summary: Storybook server failed to start',
      )
      console.error(
        'Binding a local port is not permitted in the current environment. Re-run with the approval path used for local dev servers.',
      )
    }
    process.exit(1)
  }
  const baseUrl = `http://${host}:${port}`
  console.error(`Starting Storybook smoke suite on ${baseUrl}`)

  const server = spawn(
    'npx',
    ['storybook', 'dev', '--ci', '--host', host, '-p', String(port)],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        STORYBOOK_DISABLE_TELEMETRY: '1',
      },
    },
  )

  let captured = ''
  server.stdout.on('data', (chunk) => {
    const text = chunk.toString()
    captured += text
    process.stdout.write(text)
  })
  server.stderr.on('data', (chunk) => {
    const text = chunk.toString()
    captured += text
    process.stderr.write(text)
  })

  const cleanup = () => {
    if (!server.killed) {
      server.kill('SIGTERM')
    }
  }

  process.on('exit', cleanup)
  process.on('SIGINT', () => {
    cleanup()
    process.exit(130)
  })
  process.on('SIGTERM', () => {
    cleanup()
    process.exit(143)
  })

  const reachable = await waitForReachable(baseUrl)
  if (!reachable) {
    cleanup()
    console.error(`Storybook did not become reachable: ${baseUrl}`)
    const classified = classifyFailure(captured)
    if (classified) {
      console.error(`Failure summary: ${classified.label}`)
      console.error(classified.details)
    }
    process.exit(1)
  }

  const testChild = spawn(
    'npx',
    [
      'playwright',
      'test',
      '-c',
      config,
      spec,
      '--project=chromium',
      ...(updateSnapshots ? ['--update-snapshots'] : []),
    ],
    {
      stdio: ['inherit', 'pipe', 'pipe'],
      env: {
        ...process.env,
        STORYBOOK_BASE_URL: baseUrl,
      },
    },
  )

  testChild.stdout.on('data', (chunk) => {
    const text = chunk.toString()
    captured += text
    process.stdout.write(text)
  })
  testChild.stderr.on('data', (chunk) => {
    const text = chunk.toString()
    captured += text
    process.stderr.write(text)
  })

  const exitCode = await new Promise((resolve, reject) => {
    testChild.on('error', reject)
    testChild.on('close', resolve)
  })

  cleanup()
  await new Promise((resolve) => server.once('close', resolve))

  if (exitCode === 0) {
    console.error('\nStorybook smoke suite passed.')
    return
  }

  const classified = classifyFailure(captured)
  if (classified) {
    console.error(`\nFailure summary: ${classified.label}`)
    console.error(classified.details)
  }
  process.exit(exitCode ?? 1)
}

await run()
