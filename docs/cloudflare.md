# Cloudflare Deployment

This document describes the Cloudflare production shape for `mojidata-web-app`.
The migration work is tracked in:

- https://github.com/mandel59/mojidata-web-app/issues/11
- https://github.com/mandel59/mojidata-web-app/issues/12

## Production Shape

- Public site: `https://mojidata.ryusei.dev/`
- App runtime: Cloudflare Worker `mojidata-web-app`, built with OpenNext.
- Worker custom domain: `mojidata.ryusei.dev`, configured in `wrangler.jsonc`
  with `custom_domain: true`.
- Data API: a separate D1-backed Worker deployed from
  `mojidata/packages/mojidata-api-d1-worker`.
- Browser SPA assets: `sql-wasm.wasm`, `moji.db`, and `idsfind.db` served from
  R2 through a public HTTPS asset origin.
- Glyph SVG support: precomputed glyph path shards in R2, rendered by app API
  routes.
- OpenNext incremental cache: R2 bucket
  `mojidata-web-app-opennext-cache`.

The separate API Worker is intentional. It keeps D1 import and query behavior
isolated from the Next.js Worker and gives the app Worker a smaller deployment
surface.

## Required Cloudflare Resources

- Zone: `ryusei.dev`
- Worker: `mojidata-web-app`
- Worker custom domain: `mojidata.ryusei.dev`
- R2 bucket for OpenNext cache: `mojidata-web-app-opennext-cache`
- R2 bucket for glyph path shards: `mojidata-glyph-font-assets`
- R2 bucket for SPA assets, configured outside `wrangler.jsonc`
- D1 API Worker from the `mojidata` repository
- Public HTTPS URL for the SPA asset origin

Use a Worker custom domain for the production app. Do not point
`mojidata.ryusei.dev` at a `workers.dev` hostname with a CNAME. Cloudflare
Workers custom domains make the Worker the origin and let Cloudflare manage the
DNS record and certificate.

`workers.dev` URLs are acceptable for debugging, but production traffic should
use `mojidata.ryusei.dev`.

## Build-Time Environment

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

`NEXT_PUBLIC_SPA_ASSET_BASE_URL` should normally be the asset origin, not the
`/assets/` directory URL. The browser app resolves `assets/moji.db` and related
files under that base. A `/assets/`-suffixed base is accepted for compatibility,
but the origin form avoids ambiguous double-prefix deployment mistakes.

`NEXT_PUBLIC_SPA_ASSET_VERSION` is appended as the `v` query parameter when
present. For Cloudflare production, set it explicitly if you need deterministic
cache busting. If it is not set, the build falls back to commit, deployment, or
package-version identifiers that may exist in the build environment.

`npm run cf:build` sets `MOJIDATA_SKIP_SPA_ASSETS=1` so the normal Next.js
`prebuild` step does not regenerate local SPA assets. It also fails when
generated `public/assets` files are already present unless
`MOJIDATA_ALLOW_BUNDLED_SPA_ASSETS=1` is set. This is deliberate: those files are
large and should be served from R2 for the Cloudflare target.

## Runtime Environment

Set these Worker variables in Cloudflare:

```sh
MOJIDATA_API_BASE_URL='https://mojidata-api-d1.<account>.workers.dev/'
NEXT_INC_CACHE_R2_PREFIX='mojidata-web-app'
```

`MOJIDATA_API_BASE_URL` must point at the D1-backed API Worker created from the
`mojidata` repository. The current code still contains a legacy production API
fallback for non-Cloudflare builds, but Cloudflare production should not rely on
that fallback.

If the API Worker gets a custom domain later, prefer that custom domain in
`MOJIDATA_API_BASE_URL` and keep the `workers.dev` URL only as an operational
fallback.

## Commands

Upload SPA data assets when the package data changes:

```sh
npm run cf:upload-spa-assets -- --bucket <spa-assets-bucket>
```

Regenerate and upload glyph path shards when the bundled glyph fonts or indexes
change:

```sh
npm run cf:generate-glyph-path-shards
npm run cf:upload-glyph-path-shards -- --bucket mojidata-glyph-font-assets
```

Build, preview, and deploy the Worker:

```sh
NEXT_PUBLIC_SPA_ASSET_BASE_URL='https://<spa-asset-origin>' npm run cf:build
npm run cf:preview
npm run cf:deploy
```

Use `npm run cf:typegen` after changing `wrangler.jsonc`.

## R2 Asset Notes

The R2 SPA upload command first regenerates `public/assets` from package data,
then uploads raw, Brotli, and gzip variants with long-lived cache headers.
Direct R2 custom domains do not negotiate between compressed variants
automatically. Use the uncompressed URLs as the default browser asset URLs
unless a separate asset Worker handles content negotiation and Safari behavior
has been verified.

Glyph path shards are uploaded as gzip-compressed JSON files under the R2 key
layout generated by `scripts/generate-glyph-path-shards.mjs`. The app Worker
reads them through the `GLYPH_FONT_ASSETS` R2 binding and renders SVG responses
from the precomputed path data.

## Analytics And Privacy

The Cloudflare production deployment does not enable Vercel Web Analytics or
Vercel Speed Insights by default. Those packages remain in the codebase behind
environment flags for legacy or explicit opt-in deployments. Do not enable them
for production without updating the Privacy Policy first.

Cloudflare Web Analytics is not currently injected by this app. If it is added
later, update the Privacy Policy and document the new script/configuration here.
