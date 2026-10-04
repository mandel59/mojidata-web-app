# mojidata-api 3.1.0 web deployment — 2026-10-05

Status: deployed to https://mojidata.ryusei.dev/ at 2026-10-05 01:57 JST
(2026-10-04 16:57 UTC).

Updated `@mandel59/mojidata-api` from 3.0.0 to 3.1.0 and its required
`@mandel59/mojidata-api-core` from 1.10.2 to 1.11.0. Both package declarations
and the lockfile were updated. All API adapters resolve the same core 1.11.0;
the remaining installed dependencies are unchanged.

Rebuilt web app 1.6.2 from `f81b5dd0` plus these dependency updates and a fresh
production cache prefix, `mojidata-web-app-r20261005-api310`. Build ID:
`JVF9REscxEw2OlAEzIKeo`. Worker environment types were regenerated, and OpenNext
populated 10 static cache entries before uploading the new version.

## Deployment

- Worker version at 100%: `a748c3fb-530d-490d-93a6-8a042196198a`.
- Deployment ID: `f8b371da-8786-418d-9aae-468058b5a8fd`.
- Preview: https://api310-20261005-mojidata-web-app.mandel59.workers.dev.
- Version tag: `api310-20261005`.
- SPA release: `ja-variants-20260922`.
- Asset base: https://mojidata-spa-assets.mandel59.workers.dev/releases/ja-variants-20260922.
- Rollback Worker: `a3a1af6a-0372-40dc-b832-78c5db08d1a2`.

[Production deployment snapshot](production-deployment.json) confirms the new
version serving 100%. The API endpoint remains
`https://mojidata-api-d1.mandel59.workers.dev/`. This release deploys the main
app Worker and its browser bundles, retaining the existing immutable SPA data,
glyph assets, API Worker and crawl Pages deployment.

## Validation

- Cloudflare/OpenNext build and `npx --offline tsc --noEmit` passed.
- [Local preflight](preflight.json) confirms the installed API returns the new
  `mjsm_note` for 鐥 and `kdpv_comment` for 充. All five database/Wasm binary
  SHA-256 hashes match the existing SPA release manifest.
- Six existing Playwright checks passed on preview (27.5 seconds) and
  production (26.0 seconds): warm-up, Japanese variant details in server-data
  and client-data modes, SPA search, SPA details and SPA IDS search.
- Two additional browser checks on each target captured actual SPA Worker
  responses and verified the new note fields with no page errors:
  [preview results](preview-browser-notes.json) and
  [production results](production-browser-notes.json).

The additional checks validate the data returned by the browser API. They do
not assert new UI rendering of those fields. To repeat them from the repository
root:

```sh
node 'docs/deployments/2026-10-05-api-3.1.0/verify-browser-notes.mjs' \
  'https://mojidata.ryusei.dev' '/tmp/mojidata-api310-browser-notes.json'
```

The exact version verified in preview was promoted to production. Existing
Playwright runs used the same command and immutable asset base documented in
the [previous deployment record](../2026-10-04-api-redeploy/README.md), with
this release's preview URL. All browser runs were sequential.

## Rollback

The previous Worker retains its original bundles and cache configuration:

```sh
node 'node_modules/wrangler/bin/wrangler.js' versions deploy \
  'a3a1af6a-0372-40dc-b832-78c5db08d1a2@100%' --yes
```
