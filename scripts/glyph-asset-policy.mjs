import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readdir, readFile } from 'node:fs/promises'
import { gunzipSync } from 'node:zlib'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const exec = promisify(execFile)

export async function assertPrivateGlyphBucket(bucket, command = exec) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(bucket)) throw new Error('Invalid glyph bucket name')
  const cli = path.join(root, 'node_modules/wrangler/bin/wrangler.js')
  const options = {cwd: root, timeout: 30000, env: {...process.env, WRANGLER_SEND_METRICS:'false'}}
  // Parse the pinned Wrangler CLI conservatively: authentication failures and
  // unknown output formats block uploads. No public-setting mutation is made.
  const managed = await command(process.execPath, [cli,'r2','bucket','dev-url','get',bucket], options)
  if (!/^Public access via the r2\.dev URL is disabled\.$/m.test(managed.stdout.replace(/\x1b\[[0-9;]*m/g,''))) {
    throw new Error(`Glyph bucket ${bucket} must have r2.dev disabled`)
  }
  const custom = await command(process.execPath, [cli,'r2','bucket','domain','list',bucket], options)
  if (!/^There are no custom domains connected to this bucket\.$/m.test(custom.stdout.replace(/\x1b\[[0-9;]*m/g,''))) {
    throw new Error(`Glyph bucket ${bucket} must have no custom domains`)
  }
}

function isOutlineDictionary(value) {
  return value && typeof value === 'object' && !Array.isArray(value) &&
    Object.values(value).some(entry => entry && typeof entry === 'object' && typeof entry.pathData === 'string')
}

export async function assertNoPublicGlyphAssets(directories) {
  async function visit(directory) {
    let entries
    try { entries = await readdir(directory, {withFileTypes:true}) }
    catch (error) { if (error.code === 'ENOENT') return; throw error }
    for (const entry of entries) {
      const file = path.join(directory, entry.name)
      if (entry.isSymbolicLink()) throw new Error(`Cannot audit public symlink: ${file}`)
      if (entry.isDirectory()) { await visit(file); continue }
      if (/^(?:ipamjm|Jigmo[23]?)\.ttf(?:\.(?:gz|br))?$/i.test(entry.name) ||
          /(?:glyph-paths|\.glyph-path-shards)[\/\\]/.test(file)) {
        throw new Error(`Private glyph asset in public output: ${file}`)
      }
      if (/\.json(?:\.gz)?$/.test(entry.name)) {
        const bytes = await readFile(file)
        const text = entry.name.endsWith('.gz') ? gunzipSync(bytes,{maxOutputLength:16*1024*1024}) : bytes
        let value
        try { value = JSON.parse(text.toString('utf8')) } catch { continue }
        if (isOutlineDictionary(value)) throw new Error(`Private outline dictionary in public output: ${file}`)
      }
    }
  }
  for (const directory of directories) await visit(directory)
}
