import process from 'node:process'

const release = process.env.MOJIDATA_SPA_ASSET_RELEASE?.trim()

if (!release) {
  throw new Error(
    'Set MOJIDATA_SPA_ASSET_RELEASE to the immutable R2 SPA asset release ID.',
  )
}

process.env.NEXT_PUBLIC_SPA_ASSET_BASE_URL ??=
  `https://mojidata-spa-assets.mandel59.workers.dev/releases/${release}`
process.env.NEXT_PUBLIC_SPA_ASSET_VERSION ??= release

await import('./clean-cloudflare-build-cache.mjs')
await import('./run-cloudflare-build.mjs')
