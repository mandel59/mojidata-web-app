import { createHash } from 'node:crypto'
import { readFile, realpath } from 'node:fs/promises'
import path from 'node:path'

export function safeNoticePath(name) {
  return typeof name === 'string' && /^licenses\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.(?:txt|md)$/.test(name)
}

export async function packageNoticeAssets(directory, packageName, prefix) {
  const manifestPath = path.join(directory, 'data-notices.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const identity = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'))
  if (manifest.version !== 1 || manifest.package !== packageName || identity.name !== packageName ||
      !manifest.noticeFiles || !Array.isArray(manifest.resources) || !Object.keys(manifest.noticeFiles).length) {
    throw new Error(`Invalid data notice manifest for ${packageName}`)
  }
  for (const resource of manifest.resources) {
    for (const name of [resource.licenseFile, ...(resource.noticeFiles ?? [])]) {
      if (!safeNoticePath(name) || !manifest.noticeFiles[name]) throw new Error(`Unlisted notice: ${name}`)
    }
  }
  const files = []
  const realDirectory = await realpath(directory)
  for (const [name, expected] of Object.entries(manifest.noticeFiles)) {
    if (!safeNoticePath(name) || !/^[a-f0-9]{64}$/.test(expected.sha256 ?? '')) {
      throw new Error(`Invalid notice path/hash: ${name}`)
    }
    const source = await realpath(path.join(directory, name))
    if (!source.startsWith(realDirectory + path.sep)) throw new Error(`Notice escapes package: ${name}`)
    const bytes = await readFile(source)
    if (createHash('sha256').update(bytes).digest('hex') !== expected.sha256) throw new Error(`Notice hash mismatch: ${name}`)
    files.push({ src: source, name: `${prefix}/${name}`, contentType: name.endsWith('.md') ? 'text/markdown; charset=utf-8' : 'text/plain; charset=utf-8', alwaysCopy: true })
  }
  files.push(
    { src: manifestPath, name: `${prefix}/data-notices.json`, contentType: 'application/json; charset=utf-8', alwaysCopy: true },
    { src: path.join(directory, 'LICENSE.md'), name: `${prefix}/LICENSE.md`, contentType: 'text/markdown; charset=utf-8', alwaysCopy: true },
  )
  return {
    files,
    package: { name: packageName, version: identity.version, manifest: `${prefix}/data-notices.json`, license: `${prefix}/LICENSE.md`, noticeFiles: Object.keys(manifest.noticeFiles).map(name => `${prefix}/${name}`) },
  }
}

export function compressedAssets(files) {
  return files.flatMap(({ name, contentType }) => [
    { name, contentType },
    { name: `${name}.br`, contentType, contentEncoding: 'br' },
    { name: `${name}.gz`, contentType, contentEncoding: 'gzip' },
  ])
}
