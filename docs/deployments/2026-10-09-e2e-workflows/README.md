# Functional E2E and progressive enhancement deployment

Deployed application source `7c08928cb054ae2f3cbc799d5223d158d8a746f0` to
https://mojidata.ryusei.dev/ on 2026-10-09 at 20:54 JST (11:54 UTC).

The release adds 77 functional E2E cases and fixes lowercase `ucs` conditions,
native IDS input submission without JavaScript, and visible server results
without JavaScript. IDS forms now submit trailing empty inputs, which parameter
parsing ignores. Removing canonical route-level loading boundaries also changes
the loading presentation for JavaScript-enabled server-data navigation.

## Deployment

- Worker version at 100%: `b26f13c3-3785-4ae4-a3e9-4a28aadaf68c`.
- Deployment ID: `c0bd6d96-8c8a-46e8-83a5-f98be8c68fc2`.
- Preview: https://e2e-20261009-mojidata-web-app.mandel59.workers.dev.
- Build ID: `lsgS3e0lQQyUyEne-ahNb`; 10 static R2 cache entries populated.
- SPA release: `r20261007-license-notices`.
- Rollback Worker: `9d6a3b45-8952-4038-9520-f65628776b91`.

The exact version verified in preview was promoted to production. The API
Worker, immutable database release and glyph shards retain their deployments.
The existing incremental cache prefix is used with the new build ID.

## Validation

- Chromium functional suite: 152 passed, 2 browser-specific skips.
- WebKit functional coverage and Firefox cache checks were exercised; browser
  assertion fixes passed twice in a focused run: 29 passed, 4 browser-specific
  skips. Lint and TypeScript checks passed.
- Cloudflare/OpenNext build and private glyph asset guards passed. No build-only
  loopback API URL appears in deployment JavaScript.
- All six smoke checks passed on both preview and production, with no browser
  console errors or uncaught JavaScript errors.
- Smoke checks cover lowercase `ucs`, IDS with empty fields and character detail
  navigation in client-data mode, plus native search submission, native IDS
  submission and visible character data with JavaScript disabled.

Remote server-data verification uses two fixed exact-character searches and one
character detail per target. Broad searches and the full E2E suite run locally;
deployment performs no database import or data writes. Builds use a loopback API
URL to avoid remote data queries, and the runtime retains the configured API URL.

[Preflight](preflight.json), [preview checks](preview-checks.json),
[production checks](production-checks.json) and
[deployment metadata](production-deployment.json) record the verification.

Repeat the bounded production smoke check:

```sh
node 'docs/deployments/2026-10-09-e2e-workflows/verify-smoke.mjs' \
  'https://mojidata.ryusei.dev' '/tmp/mojidata-e2e-production-checks.json'
```

## Rollback

```sh
WRANGLER_SEND_METRICS=false node 'node_modules/wrangler/bin/wrangler.js' versions deploy \
  '9d6a3b45-8952-4038-9520-f65628776b91@100%' --yes
```
