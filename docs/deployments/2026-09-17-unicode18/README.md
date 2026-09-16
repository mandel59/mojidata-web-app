# Unicode 18 deployment — 2026-09-17 (JST)

Application source: `837abe7084d52cb65aaa5a40d8b68c6f075b653a7`.
`main` was fast-forwarded from `2359d4c5` before deployment.

This release updates the data and dependencies, uses the U+6B25 Jigmo glyph
for U+2B81E, removes Vercel Analytics and Speed Insights, and removes unused
D1 bindings from the application Worker. The app uses the separately deployed
D1 API. No D1 databases were modified by this deployment.

## Published services

| Service | Deployment/version | URL |
| --- | --- | --- |
| App Worker (100% traffic) | `ddf8dbb8-a4c3-4301-b754-2396ba979d3c` | https://mojidata.ryusei.dev |
| Asset Worker | `db006f38-4d08-451e-a77b-6640d2494859` | https://mojidata-spa-assets.mandel59.workers.dev |
| Crawl Pages (production branch `cloudflare`) | `0dbffe00-be6b-4590-85d5-5b4d5a77b6f8` | https://mojidata-crawl.pages.dev |

SPA release: `u18-20260917-web-49b8e857`. The suffix identifies the dependency
and application update; the deployed source additionally removes obsolete D1
bindings. Both app and crawl builds use this release as asset base and version.

Asset base:
`https://mojidata-spa-assets.mandel59.workers.dev/releases/u18-20260917-web-49b8e857`

[The archived manifest](spa-manifest.json) records all 30 immutable assets,
including compressed variants and five attribution/license notices. Its remote
copy is at
https://pub-71ea5f978f41419c8fbd653a44326929.r2.dev/releases/u18-20260917-web-49b8e857/manifest.json.

## Validation

- Clean npm installation, lint, type checking, release asset checks, and builds
  passed before publication.
- The uploaded manifest matched the local manifest. All 30 remote asset headers
  and CORS responses passed; SHA-256 and byte lengths matched for all 10 raw
  assets. All five DB/Wasm asset redirects retained the release prefix.
- Six Playwright preview checks passed, including browser search, character
  details, IDS search, changed queries, and cached result restoration.
- The production U+2B81E server-data page returned HTTP 200 with its code point.
  Its nonempty SVG was identical to U+6B25.
- Crawl SPA desktop/mobile checks passed locally and on production. Production
  Firefox reused the Brotli mojidata DB from its HTTP cache.
- Cloudflare reported the app version at 100% and the new Pages deployment as
  Production.

The moji.db and FTS5 database source hashes match the separately deployed D1
release recorded in the sibling mojidata repository's
`docs/deployments/2026-09-17-unicode18/`.

## Previous deployments

- App: `84255686-f202-42b7-8b72-c252fbb633b7`
- Asset Worker: `9ac8e88b-89e4-4d6b-b013-34bb18a448e5`
- Crawl Pages: `4f26f3ab-dbb5-4a01-9cc4-2294caf6f508`

The previous app version referenced D1 databases that had already been deleted.
Do not blindly promote that version for rollback: rebuild the required old
application code without those obsolete bindings. Keep existing immutable asset
releases available for previously cached clients.
