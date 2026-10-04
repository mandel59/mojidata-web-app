# Web app redeployment after API update — 2026-10-04

Status: deployed to production at 2026-10-04 23:18 JST (14:18 UTC).
Public site: https://mojidata.ryusei.dev/.

Rebuilt web app 1.6.2 after the API reference notes release from
[mojidata PR #75](https://github.com/mandel59/mojidata/pull/75). The app uses
`https://mojidata-api-d1.mandel59.workers.dev/`, whose public API version is
`8d43a3a3-9074-4dfa-9ecd-0682dfa31643` according to the API deployment record.

The build starts from web source `0069e302` with the production incremental
cache prefix changed to `mojidata-web-app-r20261004-api-notes` and regenerated
Worker environment types. The Cloudflare build clears local fetch/cache
artifacts and creates build ID `-gTiJwQ4ZT6imFyGM5RKH`. OpenNext populated
10 static cache entries under the new cache namespace before upload.

## Deployment

- Worker version at 100%: `a3a1af6a-0372-40dc-b832-78c5db08d1a2`.
- Deployment ID: `ffa20fd6-025a-4b1e-8c27-2161481f582c`.
- Version tag: `api-notes-20261004`.
- Preview: https://api-notes-20261004-mojidata-web-app.mandel59.workers.dev.
- SPA release: `ja-variants-20260922`.
- SPA asset base: https://mojidata-spa-assets.mandel59.workers.dev/releases/ja-variants-20260922.
- Rollback Worker: `8a300658-aed9-4b6b-afb7-bb8f340a5794`.

Cloudflare reported the rollback version already serving 100% before this
redeployment, superseding the held-promotion status in the September 22
preparation record. This operation rebuilt and deployed the main app Worker;
the API Worker, SPA asset release, glyph shards and crawl Pages deployment
retain their existing deployments.

[Production deployment snapshot](production-deployment.json) confirms the new
Worker version at 100%. [Preflight results](preflight.json) record an exact
comparison of the remote R2 manifest with the September 22 SPA manifest and
two fixed selected API requests confirming `mji[].mjsm_note` for 鐥 and
`kdpv_comment` for 充. The frontend retains its existing rendering behavior.

## Validation

- Cloudflare/OpenNext production build and `npx --offline tsc --noEmit` passed.
- Preview: six Playwright checks passed in 35.8 seconds.
- Production: the same six checks passed in 24.5 seconds.
- Checks cover route/asset warm-up, Japanese variant details in server-data
  and client-data modes, SPA search, SPA character details and SPA IDS search.
- Server-side search queries were excluded from this smoke run; browser SPA
  searches execute against the existing browser database assets.

The browser verification command, run sequentially for preview and production:

```sh
PLAYWRIGHT_TEST_SPA_ASSET_BASE_URL='https://mojidata-spa-assets.mandel59.workers.dev/releases/ja-variants-20260922' \
  npm run test:e2e:target -- \
  --base-url 'https://mojidata.ryusei.dev' -- \
  'tests/e2e/japanese-variants.spec.ts' 'tests/e2e/spa.spec.ts' \
  --project=chromium --workers=1 \
  --grep 'Japanese variant details|search-spa renders results in browser|mojidata-spa renders character data in browser|idsfind-spa renders results in browser'
```

The default sandbox build failed to capture TypeScript's `--showConfig`
output; the build succeeded outside that sandbox. OpenNext's upload wrapper
also split the deployment message into shell arguments after cache population,
so the completed build was uploaded directly with `wrangler versions upload`.
Production promotion used the exact version verified in preview.

## Rollback

Keep the existing immutable SPA release and previous cache namespace. To
restore the previous Worker version:

```sh
node 'node_modules/wrangler/bin/wrangler.js' versions deploy \
  '8a300658-aed9-4b6b-afb7-bb8f340a5794@100%' --yes
```
