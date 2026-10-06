# License notice deployment — 2026-10-07

Deployed to https://mojidata.ryusei.dev/ on 2026-10-07 02:52 JST.
Related: mandel59/mojidata#80. Source commit: `90b87d0cb2c33b090f4475a6d1ad4940af9391ed`.

The app displays the committed font notices, manifest-validated database
notices, and the user-provided GlyphWiki reuse paragraph. The GlyphWiki text is
explicitly an excerpt: it retains the quoted-material exception and omits
contributor instructions. Its official source, unknown revision, provided date
and SHA-256 are recorded with the text.

The immutable SPA release `r20261007-license-notices` contains all 132 raw,
Brotli and gzip objects plus its manifest. The asset Worker supports nested
notices. When a remote asset base is configured, app `/assets/*` URLs redirect
to the release before filesystem routing. This avoids the production 404 caused
by trying to read traced local build files inside the Cloudflare Worker.
Unconfigured local development still serves its prepared files from disk.

## Deployment and validation

- App Worker: `80c69c2f-a248-4ab6-b9da-f10d85eeed5c` at 100%.
- Asset Worker: `c6626298-c51d-46e2-a190-edc985bc59ea` at 100%.
- Build ID: `mlfyjH5LlsUWhbrrgn6oL`; 10 static R2 cache entries populated.
- API backend and incremental cache prefix retain their existing values.
- Six local release tests, the final production-build Chromium license test,
  type/lint checks and full OpenNext build passed.
- [Production checks](production-checks.json) verify the license excerpt,
  both WOFF2 files and three notice/manifest URLs against local bytes, plus the
  immutable release manifest. A raw glyph-shard request remains 404.
- [Deployment snapshot](production-deployment.json),
  [asset Worker snapshot](asset-worker-deployment.json),
  [release manifest](spa-manifest.json) and [preflight](preflight.json) record
  versions, bindings/configuration and artifact hashes.

Production verification requested only static license/font/notice URLs and
Worker metadata. No data API route, remote D1 query or import was executed.
Build and local-browser API access used an unused loopback port; that URL is
absent from the deployment bundle. See the [quota evidence](../../d1-quota-reviews/2026-10-07-web-license-notices.json)
and [license distribution review](../../licensing/2026-10-07-web-notices.md).

## Rollback

Restore the app Worker from before this work:

```sh
WRANGLER_SEND_METRICS=false node node_modules/wrangler/bin/wrangler.js versions deploy \
  'a748c3fb-530d-490d-93a6-8a042196198a@100%' --yes
```

That Worker retains its previous immutable SPA URLs and bundles. The new asset
Worker preserves legacy paths, and published R2 releases were not overwritten.
