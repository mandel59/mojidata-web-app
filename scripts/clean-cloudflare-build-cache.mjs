import { rm } from 'node:fs/promises'

const cachePaths = ['.next/cache/fetch-cache', '.open-next/cache']

for (const path of cachePaths) {
  await rm(path, { recursive: true, force: true })
  console.log(`Removed ${path}`)
}
