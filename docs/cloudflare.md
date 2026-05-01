# Cloudflare deployment

This document tracks the initial Cloudflare Workers migration path for
`mojidata-web-app`. The deployment plan is tracked in
https://github.com/mandel59/mojidata-web-app/issues/11.

## Target shape

- Deploy the Next.js app to Cloudflare Workers with OpenNext.
- Keep `mojidata-api` data serving in a separate D1-backed Worker from the
  `mojidata` repository for the first production validation.
- Put browser SPA data assets (`sql-wasm.wasm`, `moji.db`, `idsfind.db`) in R2
  behind a public custom domain instead of bundling them into the Worker assets.
- Use R2 for OpenNext's incremental cache through the
  `NEXT_INC_CACHE_R2_BUCKET` binding.
- Keep request routing in `src/middleware.ts` for the Cloudflare target. Next.js
  recommends `proxy.ts`, but Next 16 proxy runs on the Node.js middleware
  runtime, which OpenNext for Cloudflare does not support.

The separate API Worker is intentionally the first target. It isolates D1 import
and query behavior from the Next.js migration and keeps a fallback path if a
future embedded D1 API inside the app Worker proves too large or too coupled.

## Required Cloudflare resources

- Worker: `mojidata-web-app`
- R2 bucket for OpenNext cache: `mojidata-web-app-opennext-cache`
- R2 bucket for SPA assets, for example: `mojidata-spa-assets`
- D1 API Worker deployed from `mojidata/packages/mojidata-api-d1-worker`
- Public HTTPS URL for the D1 API Worker
- Public HTTPS custom domain for the SPA asset R2 bucket

## Build-time environment

These values must be present when `npm run cf:build` runs because the browser
bundle needs final SPA asset URLs:

```sh
NEXT_PUBLIC_SPA_ASSET_BASE_URL='https://assets.example.com'
```

Alternatively, set all per-asset overrides:

```sh
NEXT_PUBLIC_SPA_SQL_WASM_URL='https://assets.example.com/assets/sql-wasm.wasm'
NEXT_PUBLIC_SPA_MOJIDATA_DB_URL='https://assets.example.com/assets/moji.db'
NEXT_PUBLIC_SPA_IDSFIND_DB_URL='https://assets.example.com/assets/idsfind.db'
```

`NEXT_PUBLIC_SPA_ASSET_VERSION` is still appended as the `v` query parameter
when present. If it is not set, the build falls back to Vercel, Cloudflare
Pages, or package-version identifiers where available.

`npm run cf:build` sets `MOJIDATA_SKIP_SPA_ASSETS=1` so the normal Next.js
`prebuild` step does not regenerate local SPA assets. It also fails when
generated `public/assets` files are already present unless
`MOJIDATA_ALLOW_BUNDLED_SPA_ASSETS=1` is set. This is deliberate: those files are
large and should be served from R2 for the Cloudflare target.

## Runtime environment

Set these Worker variables in Cloudflare:

```sh
MOJIDATA_API_BASE_URL='https://mojidata-api-d1.<account>.workers.dev/'
NEXT_INC_CACHE_R2_PREFIX='mojidata-web-app'
```

`MOJIDATA_API_BASE_URL` should point at the D1-backed API Worker created from the
`mojidata` repository. Without it, production keeps the existing Vercel API
fallback.

## Commands

```sh
npm run cf:upload-spa-assets -- --bucket mojidata-spa-assets
npm run cf:build
npm run cf:preview
npm run cf:deploy
```

Use `npm run cf:typegen` after changing `wrangler.jsonc`.

The R2 upload command first regenerates `public/assets` from package data, then
uploads raw, Brotli, and gzip variants with long-lived cache headers. Direct R2
custom domains do not negotiate between the compressed variants automatically;
use the uncompressed URLs as the default browser asset URLs unless a separate
asset Worker handles content negotiation and Safari behavior has been verified.
