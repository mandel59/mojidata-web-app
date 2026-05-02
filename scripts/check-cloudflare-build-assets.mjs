import { readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicAssetsDir = path.join(rootDir, 'public', 'assets')
const requiredAssetEnvNames = [
  'NEXT_PUBLIC_SPA_SQL_WASM_URL',
  'NEXT_PUBLIC_SPA_SQLITE_WASM_URL',
  'NEXT_PUBLIC_SPA_MOJIDATA_DB_URL',
  'NEXT_PUBLIC_SPA_IDSFIND_DB_URL',
  'NEXT_PUBLIC_SPA_IDSFIND_FTS5_DB_URL',
]

function hasRemoteAssetConfig() {
  if (process.env.NEXT_PUBLIC_SPA_ASSET_BASE_URL?.trim()) return true
  return requiredAssetEnvNames.every((name) => process.env[name]?.trim())
}

async function listPublicAssets() {
  try {
    return await readdir(publicAssetsDir)
  } catch {
    return []
  }
}

if (!hasRemoteAssetConfig()) {
  throw new Error(
    [
      'Cloudflare builds must use R2/CDN-hosted SPA assets.',
      'Set NEXT_PUBLIC_SPA_ASSET_BASE_URL, or set all per-asset URL overrides:',
      ...requiredAssetEnvNames.map((name) => `- ${name}`),
    ].join('\n'),
  )
}

if (process.env.MOJIDATA_ALLOW_BUNDLED_SPA_ASSETS !== '1') {
  const bundledAssets = (await listPublicAssets()).filter((name) =>
    /^(sql-wasm\.wasm|sqlite3\.wasm|moji\.db|idsfind\.db|idsfind-fts5\.db)(?:\.(?:br|gz))?$/.test(
      name,
    ),
  )

  if (bundledAssets.length > 0) {
    throw new Error(
      [
        'Generated SPA assets are present in public/assets and would be bundled into the Cloudflare Worker assets.',
        'Upload them to R2 with npm run cf:upload-spa-assets, move generated assets out of public/assets before cf:build,',
        'or set MOJIDATA_ALLOW_BUNDLED_SPA_ASSETS=1 if you intentionally want to bundle them.',
        `Found: ${bundledAssets.join(', ')}`,
      ].join('\n'),
    )
  }
}
