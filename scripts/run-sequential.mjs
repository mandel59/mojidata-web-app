#!/usr/bin/env node

import { spawn } from 'node:child_process'

function printUsageAndExit(message) {
  if (message) {
    console.error(message)
    console.error('')
  }
  console.error(
    [
      'Usage:',
      '  node scripts/run-sequential.mjs --cmd "npm run lint" --cmd "./node_modules/.bin/tsc --noEmit"',
    ].join('\n'),
  )
  process.exit(1)
}

function parseArgs(argv) {
  const commands = []

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg !== '--cmd') {
      printUsageAndExit(`Unknown argument: ${arg}`)
    }
    const value = argv[i + 1]
    if (value == null) {
      printUsageAndExit('Missing value for --cmd')
    }
    commands.push(value)
    i += 1
  }

  if (commands.length === 0) {
    printUsageAndExit('At least one --cmd is required')
  }

  return commands
}

async function runCommand(command, index, total) {
  console.error(`\n[${index}/${total}] ${command}`)

  const child = spawn('/bin/zsh', ['-lc', command], {
    stdio: 'inherit',
    env: process.env,
  })

  const exitCode = await new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('close', resolve)
  })

  if (exitCode !== 0) {
    process.exit(exitCode ?? 1)
  }
}

const commands = parseArgs(process.argv.slice(2))

for (const [index, command] of commands.entries()) {
  await runCommand(command, index + 1, commands.length)
}

console.error('\nSequential command run passed.')
