import { mkdir, rename, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicAssetsDir = path.join(rootDir, 'public', 'assets')
const stashRoot = path.join(rootDir, 'dist', '.cloudflare-build-stash')
const stashDir = path.join(stashRoot, `public-assets-${process.pid}-${Date.now()}`)

async function exists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

function relative(filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join('/')
}

async function run(command, args, env = {}) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      env: {
        ...process.env,
        ...env,
      },
      stdio: 'inherit',
    })
    child.on('error', reject)
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve()
      } else if (signal) {
        reject(new Error(`${command} ${args.join(' ')} exited by ${signal}`))
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with ${code}`))
      }
    })
  })
}

async function stashPublicAssets() {
  if (!(await exists(publicAssetsDir))) return false
  await mkdir(stashRoot, { recursive: true })
  await rename(publicAssetsDir, stashDir)
  console.log(
    `[cf:build] temporarily moved ${relative(publicAssetsDir)} to ${relative(
      stashDir,
    )}`,
  )
  return true
}

async function restorePublicAssets(stashed) {
  if (!stashed) return
  await mkdir(path.dirname(publicAssetsDir), { recursive: true })
  if (await exists(publicAssetsDir)) {
    const generatedDuringBuildDir = `${publicAssetsDir}.generated-${process.pid}-${Date.now()}`
    await rename(publicAssetsDir, generatedDuringBuildDir)
    console.warn(
      `[cf:build] preserved build-created ${relative(
        publicAssetsDir,
      )} at ${relative(generatedDuringBuildDir)}`,
    )
  }
  await rename(stashDir, publicAssetsDir)
  console.log(`[cf:build] restored ${relative(publicAssetsDir)}`)
}

const stashed = await stashPublicAssets()
try {
  await run('node', ['scripts/check-cloudflare-build-assets.mjs'])
  await run('opennextjs-cloudflare', ['build'], {
    MOJIDATA_SKIP_SPA_ASSETS: '1',
  })
} finally {
  await restorePublicAssets(stashed)
}
