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
- Browser SPA assets: `sqlite3.wasm`, fallback `sql-wasm.wasm`, `moji.db`, FTS4
  `idsfind.db`, and FTS5 `idsfind-fts5.db` served from R2 through a public
  HTTPS asset origin.
- Browser SPA asset negotiation: Worker `mojidata-spa-assets`, which redirects
  `sqlite3.wasm`, `sql-wasm.wasm`, `moji.db`, `idsfind.db`, and
  `idsfind-fts5.db` to Brotli-compressed R2 objects for browsers that can
  decode them.
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
- R2 bucket for SPA assets: `mojidata-spa-assets`, configured outside the main
  app `wrangler.jsonc`
- Worker for SPA asset negotiation: `mojidata-spa-assets`
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
NEXT_PUBLIC_SPA_SQLITE_WASM_URL='https://assets.example.com/assets/sqlite3.wasm'
NEXT_PUBLIC_SPA_MOJIDATA_DB_URL='https://assets.example.com/assets/moji.db'
NEXT_PUBLIC_SPA_IDSFIND_DB_URL='https://assets.example.com/assets/idsfind.db'
NEXT_PUBLIC_SPA_IDSFIND_FTS5_DB_URL='https://assets.example.com/assets/idsfind-fts5.db'
```

For Cloudflare production, route the browser SQLite/Wasm assets through the asset
Worker so modern browsers receive the Brotli R2 objects and fallback clients
receive raw R2 objects:

```sh
NEXT_PUBLIC_SPA_SQL_WASM_URL='https://mojidata-spa-assets.mandel59.workers.dev/assets/sql-wasm.wasm'
NEXT_PUBLIC_SPA_SQLITE_WASM_URL='https://mojidata-spa-assets.mandel59.workers.dev/assets/sqlite3.wasm'
NEXT_PUBLIC_SPA_MOJIDATA_DB_URL='https://mojidata-spa-assets.mandel59.workers.dev/assets/moji.db'
NEXT_PUBLIC_SPA_IDSFIND_DB_URL='https://mojidata-spa-assets.mandel59.workers.dev/assets/idsfind.db'
NEXT_PUBLIC_SPA_IDSFIND_FTS5_DB_URL='https://mojidata-spa-assets.mandel59.workers.dev/assets/idsfind-fts5.db'
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
`prebuild` step does not regenerate local SPA assets. Local SPA data assets are
generated under `dist/spa-assets/`, outside Next.js `public/`, so they are not
bundled into the Cloudflare Worker. If legacy `public/assets/` data files are
present, the Cloudflare build wrapper temporarily moves that directory out of
the way during the OpenNext build and restores it afterward.

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

Deploy the SPA asset Worker:

```sh
npm run cf:asset-worker:dry-run
npm run cf:asset-worker:deploy
```

Regenerate and upload glyph path shards when the bundled glyph fonts or indexes
change:

```sh
npm run cf:generate-glyph-path-shards
npm run cf:upload-glyph-path-shards -- --bucket mojidata-glyph-font-assets
```

Build, preview, and deploy the Worker:

```sh
npm run cf:build:asset-worker
npm run cf:preview
npm run cf:deploy
```

Use `npm run cf:deploy:asset-worker` to build and deploy the OpenNext Worker in
one step with `sqlite3.wasm`, fallback `sql-wasm.wasm`, `moji.db`, and
both IDS DB variants all routed through `mojidata-spa-assets`.

Use `npm run cf:typegen` after changing `wrangler.jsonc`.

## R2 Asset Notes

The R2 SPA upload command first regenerates `dist/spa-assets` from package data,
then uploads raw, Brotli, and gzip variants with long-lived cache headers.
Direct R2 custom domains do not negotiate between compressed variants
automatically. Use the uncompressed URLs as the default browser asset URLs
unless a separate asset Worker handles content negotiation and Safari behavior
has been verified.

The asset Worker is configured by `wrangler.spa-assets.jsonc` and redirects
`/assets/sqlite3.wasm`, `/assets/sql-wasm.wasm`, `/assets/moji.db`,
`/assets/idsfind.db`, and `/assets/idsfind-fts5.db` to the public R2 asset
origin. It chooses `.br` or raw R2 objects from
`Accept-Encoding`, sets `Vary: Accept-Encoding`, and returns a long-lived 307 so
the browser can cache the logical asset URL redirect. It intentionally does not
use the gzip variants; the mitigation only needs Brotli for modern browsers and
raw bytes for fallback clients. For Safari/WebKit user agents it redirects DB
assets to raw R2 objects because WebKit has been observed to be fragile with
large `application/octet-stream` responses using `Content-Encoding`.

Do not stream precompressed `.br` objects through the Worker R2 binding for this
use case. Browser testing showed that a Worker response built from the R2 binding
body and `Content-Encoding: br` exposed compressed bytes to
`fetch().arrayBuffer()`. Direct R2 `.br` responses decode correctly in the
browser, so the Worker remains a lightweight negotiation/redirect layer instead
of a byte-serving origin.

Firefox currently has a default disk cache entry limit that can prevent the raw
`moji.db` response, about 92.8 MiB, from being cached. Serving
`/assets/moji.db` through `mojidata-spa-assets` maps that URL to the Brotli R2
object, about 26.1 MiB on the current dataset, while `fetch().arrayBuffer()`
still receives the decoded SQLite bytes.

The same Worker also routes `idsfind.db`, `idsfind-fts5.db`, `sqlite3.wasm`,
and fallback `sql-wasm.wasm` to their Brotli R2 objects for browsers that
advertise `br`; Safari/WebKit still receives raw DB assets.

Glyph path shards are uploaded as gzip-compressed JSON files under the R2 key
layout generated by `scripts/generate-glyph-path-shards.mjs`. The app Worker
reads them through the `GLYPH_FONT_ASSETS` R2 binding and renders SVG responses
from the precomputed path data.

## Crawl SPA

Non-major crawlers should be steered toward a static, client-side crawl SPA
instead of the OpenNext Worker. The goal is not to block data access; it is to
make large crawls use cache-friendly browser data assets instead of SSR, RSC
prefetches, and SVG API routes.

The crawl SPA is built from `crawl-spa/` and outputs to `dist/crawl-spa`:

```sh
npm run crawl-spa:build
```

Verify it locally with a static server and browser checks:

```sh
npm run crawl-spa:verify
```

Or verify a deployed endpoint:

```sh
MOJIDATA_CRAWL_SPA_VERIFY_BASE_URL='https://mojidata-crawl.pages.dev' npm run crawl-spa:verify
```

To also verify that Firefox reuses the cached Brotli `moji.db` response:

```sh
MOJIDATA_CRAWL_SPA_VERIFY_BASE_URL='https://mojidata-crawl.pages.dev' \
MOJIDATA_CRAWL_SPA_VERIFY_FIREFOX_CACHE='1' \
node scripts/verify-crawl-spa.mjs
```

Deploy it to Cloudflare Pages:

```sh
npm run crawl-spa:deploy
```

Deploy it with the SQLite/Wasm assets routed through the asset Worker:

```sh
npm run crawl-spa:deploy:asset-worker
```

The default project name is `mojidata-crawl`, deployed from the `cloudflare`
branch to `https://mojidata-crawl.pages.dev/`. A custom domain such as
`mojidata-crawl.ryusei.dev` can be added later if we want to avoid exposing the
shared `pages.dev` namespace in redirects.

JavaScript, CSS, and Worker assets are emitted with content-hashed filenames and
served with immutable cache headers. Do not use stable names such as
`/assets/main.js` for these files; otherwise browsers and crawlers can keep an
old JS bundle while receiving a new HTML entrypoint.

The crawl SPA sets `noindex, follow` headers and points its runtime canonical
URL back at `https://mojidata.ryusei.dev/...`. It reuses the production React
view components and CSS modules through a small static-SPA entrypoint. Only the
Next.js router/link APIs, SVG glyph image components, and browser API adapter
are replaced by crawl-specific shims.

It intentionally uses:

- R2-published `sql-wasm.wasm`, `moji.db`, and `idsfind.db`.
- A browser Web Worker for local `mojidata-api` queries.
- Text glyph fallback only, avoiding `/api/glyphwiki/svg/...` and
  `/api/ipamjm/svg/...`.
- History API navigation instead of Next.js App Router, avoiding RSC requests
  while keeping the same visual components as the canonical app.

Set these build-time values when the R2 asset origin or cache-busting version
changes:

```sh
MOJIDATA_CRAWL_SPA_ASSET_BASE_URL='https://<spa-asset-origin>'
MOJIDATA_CRAWL_SPA_SQL_WASM_URL='https://mojidata-spa-assets.mandel59.workers.dev/assets/sql-wasm.wasm'
MOJIDATA_CRAWL_SPA_MOJIDATA_DB_URL='https://mojidata-spa-assets.mandel59.workers.dev/assets/moji.db'
MOJIDATA_CRAWL_SPA_IDSFIND_DB_URL='https://mojidata-spa-assets.mandel59.workers.dev/assets/idsfind.db'
MOJIDATA_CRAWL_SPA_ASSET_VERSION='<asset-version>'
```

### Redirect Non-Major Bots

Use the redirect script to create or update a Cloudflare Single Redirect rule:

```sh
npm run crawl-spa:redirect:dry-run
npm run crawl-spa:redirect:apply
```

The redirect script uses `CLOUDFLARE_API_TOKEN` when set. Applying or even
reading the Rulesets entrypoint requires a token with Cloudflare Rulesets
permissions, for example Dynamic URL Redirects Read/Write or Account Rulesets
Read/Write. The default Wrangler OAuth token may not have these permissions.

The rule targets common non-major crawlers such as SemrushBot, DotBot, AhrefsBot,
MJ12Bot, and similar research/SEO crawlers. It leaves Googlebot, Bingbot, and
Google-InspectionTool on the canonical server-rendered path.

Important: Single Redirects only run when the source hostname is proxied through
Cloudflare. If `mojidata.ryusei.dev` is DNS-only and points directly at Vercel,
this rule will not execute.

The Cloudflare rule is the primary control because it runs before the OpenNext
Worker and therefore avoids Worker invocations for redirected crawlers. The app
middleware also has a narrow fallback for the same crawler families and routes.
That fallback only matters if the Cloudflare rule is missing or disabled, and it
can be turned off with:

```sh
CRAWL_SPA_REDIRECT_DISABLE='1'
```

Override the fallback target only when testing a different crawl SPA origin:

```sh
CRAWL_SPA_REDIRECT_BASE_URL='https://mojidata-crawl.pages.dev'
```

After applying the Cloudflare rule, verify that non-major crawlers are
redirected before the Worker and major/search crawlers are not:

```sh
curl -I -A 'Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)' \
  'https://mojidata.ryusei.dev/idsfind'
curl -I -A 'Mozilla/5.0 (compatible; DotBot/1.2; +https://opensiteexplorer.org/dotbot; help@moz.com)' \
  'https://mojidata.ryusei.dev/mojidata/%E5%90%8D?x=1'
curl -I -A 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' \
  'https://mojidata.ryusei.dev/mojidata/%E5%90%8D'
```

The SemrushBot and DotBot examples should return `307` with `Location:
https://mojidata-crawl.pages.dev/...` and should not include `x-opennext`.
The Googlebot example should stay on the app Worker and return `200` with
`x-opennext: 1`.

## Analytics And Privacy

The Cloudflare production deployment does not enable Vercel Web Analytics or
Vercel Speed Insights by default. Those packages remain in the codebase behind
environment flags for legacy or explicit opt-in deployments. Do not enable them
for production without updating the Privacy Policy first.

Cloudflare Web Analytics is not currently injected by this app. If it is added
later, update the Privacy Policy and document the new script/configuration here.
