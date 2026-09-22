# Japanese variant patch release — 2026-09-22

Status: prepared; production promotion is on hold because the existing D1 API
has exhausted the account's free-tier daily row-read allowance. API Worker logs
confirmed this condition during verification. The API reports that the quota
resets at midnight UTC (2026-09-23 09:00 JST). No billing plan was changed.

Application source: `2c5f9c5111d2391d19271c16d382506dc988ce14`.

## Changes

- App version 1.6.2, including new server-data cache keys.
- Published `@mandel59/mojidata@1.9.1` and `@mandel59/mojidata-api-core@1.10.2`.
- Japanese new/old variant property types and search help.
- Asset copying compares SHA-256 rather than only file sizes, and regenerates
  compressed assets when content changes. This release's new SQLite DB has the
  same byte length as its predecessor, making the fix necessary.
- Browser regression coverage for 弁 ↔ 瓣・辨・辯 in both execution modes.

## Prepared artifacts

- Immutable SPA release: `ja-variants-20260922` (uploaded).
- App Worker version: `8a300658-aed9-4b6b-afb7-bb8f340a5794` (not promoted).
- Preview: https://ja-variants-20260922-mojidata-web-app.mandel59.workers.dev
- Asset base: https://mojidata-spa-assets.mandel59.workers.dev/releases/ja-variants-20260922
- [SPA manifest](spa-manifest.json) records all 30 files and license notices.
- Crawl SPA built in `dist/crawl-spa` with the same asset release; not promoted.

The moji.db SHA-256 is
`c8cd43031d6a48bde6b131f0fd0fb778301627846c4b65ff038937884c21ea6b`,
matching the 2026-09-22 API deployment in the sibling mojidata repository.
Only moji.db and its compressed variants differ from the previous public asset
release. Existing immutable assets and glyph shards are retained.

## Validation

- Lint, TypeScript, release-asset regression checks, Cloudflare build and crawl
  build passed.
- Remote manifest equals the local manifest. All 30 remote asset headers and
  CORS checks passed; all 10 raw file SHA-256 digests and byte lengths match.
- Crawl SPA desktop/mobile search-to-detail checks passed locally with remote
  release assets.
- Local Next.js Japanese regression tests passed in both server-data and
  client-data modes (four checks plus setup), using the published SQLite data.
- Final 1.6.2 Cloudflare preview: eight Playwright checks passed, including
  setup, Japanese searches/details, SPA search/details/IDS search, and changed
  query/cache restoration.
- Cloudflare preview server-data tests are blocked by upstream HTTP 500s.
  Direct API requests also fail; Worker logs explicitly report the D1 quota
  exhaustion. Local Cloudflare preview additionally lacks the remote glyph R2
  contents, so it is not a complete production smoke-test environment.

## Complete the release after API recovery

Run the Japanese regression tests against the prepared preview:

```sh
PLAYWRIGHT_TEST_SPA_ASSET_BASE_URL='https://mojidata-spa-assets.mandel59.workers.dev/releases/ja-variants-20260922' \
  npm run test:e2e:target -- \
  --base-url 'https://ja-variants-20260922-mojidata-web-app.mandel59.workers.dev' \
  -- 'tests/e2e/japanese-variants.spec.ts' --project=chromium --workers=1
```

After successful verification, promote the exact tested Worker version and
publish the crawl SPA using the same asset release:

```sh
node 'node_modules/wrangler/bin/wrangler.js' versions deploy \
  '8a300658-aed9-4b6b-afb7-bb8f340a5794@100%' --yes
MOJIDATA_SPA_ASSET_RELEASE='ja-variants-20260922' npm run crawl-spa:deploy:asset-worker
```

Repeat browser verification against production, record the Pages deployment ID,
and update this document's status. Publish the release source through Jujutsu.

## Previous production versions

- App Worker: `ddf8dbb8-a4c3-4301-b754-2396ba979d3c` (confirmed still at 100%).
- Crawl Pages: `0dbffe00-be6b-4590-85d5-5b4d5a77b6f8`.
- SPA assets: `u18-20260917-web-49b8e857`.

Keep the old immutable asset release for rollback. D1 databases and the separate
API Worker were not modified by this web app release preparation.
