# GlyphWiki license revision deployment

Deployed to https://mojidata.ryusei.dev/ on 2026-10-07 07:35 JST.
Related: mandel59/mojidata#80. Application source: `5d7c0c934668aaa573c71c689e04a40b2d2ee5f8`.
The preflight records were pushed as `daa693adf8c4` before deployment.

The license page links directly to the official GlyphWiki license and revision
`@18`, with its displayed timestamp of 2025-09-03 12:12. It retains a link to
the saved license excerpt. The internal source-record link was removed from
`LICENSE.md`; the record remains available for provenance and hash checks.

## Validation

- Worker version: `9d6a3b45-8952-4038-9520-f65628776b91` at 100%.
- Build ID: `SfpcvaC3gTeoa4O1crW4y`; 10 static R2 cache entries populated.
- Reused SPA release: `r20261007-license-notices`.
- Six release-asset tests, the local production-build Chromium license test,
  Next type checking and the OpenNext build passed.
- Both built locales and both public license pages contain the revision link
  and timestamp, omit the source-record link, and retain the original excerpt.
- API backend, incremental cache prefix and glyph bucket keep their existing
  configuration. Deployment JavaScript contains no build-only loopback API URL.

[Preflight](preflight.json) records file fingerprints and local checks.
[Production checks](production-checks.json) record the public page verification;
[deployment metadata](production-deployment.json) confirms 100% traffic.
See the [D1 impact record](../../d1-quota-reviews/2026-10-07-glyphwiki-revision.json).
Only static license pages and Worker metadata were requested remotely.

## Rollback

Restore the immediately preceding app Worker:

```sh
WRANGLER_SEND_METRICS=false node node_modules/wrangler/bin/wrangler.js versions deploy \
  'f9b802c0-5bff-4a6c-92f1-a16793db88a9@100%' --yes
```

The previous Worker retains its existing SPA release and R2 configuration.
