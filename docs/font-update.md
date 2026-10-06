# Font update workflow

Run commands from the repository root. Use this workflow when replacing a font
release or regenerating its distributed files.

## Font families and outputs

| Family | Build command | Directory | Committed distribution files | Retained upstream notices |
| --- | --- | --- | --- | --- |
| CJK Symbols | `scripts/build-font-cjksymbols` | `src/fonts/cjksymbols` | `CJKSymbols-Regular.woff2` | `LICENSE.txt`, `README.md` |
| Adobe NotDef | `scripts/build-font-notdef` | `src/fonts/notdef` | `AND-Regular.woff2` | `LICENSE.md`, `README.md` |
| IPAmjMincho | `scripts/build-font-ipamjm` | `src/fonts/ipamjm` | `ipamjm.ttf.gz`, `glyph-index.txt.gz` | `IPA_Font_License_Agreement_v1.0.txt`, `Readme.txt` |
| Jigmo | `scripts/build-font-jigumo` | `src/fonts/jigmo` | `Jigmo.ttf.gz`, `Jigmo2.ttf.gz`, `Jigmo3.ttf.gz`, `glyph-index.txt.gz` | `LICENSE.txt`, `README.txt`, `THANKS.txt` |

The Jigmo command is spelled `build-font-jigumo`. Keep distribution files and
notices committed together so a clone can run without native font tools.
Uncompressed TTFs, temporary OTFs and generated outline shards are ignored.

## 1. Select and record the upstream release

Record the previous revision and font hashes before regeneration. Obtain the
new release from its upstream project and read its release notes, license and
README. Record the release version or commit, URL and SHA-256 of each input.

Update `download.txt` with the new source URLs and SHA-256 values. Pin raw
GitHub URLs to a commit rather than a moving branch. For CJK Symbols and Adobe
NotDef, use license/README files from the same revision as the font. If an
archive name changes, update the matching variable in `build-font-ipamjm` or
`build-font-jigumo` and check its extracted member names.

`scripts/download` verifies the declared digest before using a source and
stores it under `cache/.sha256sum/<name>-<sha256>.<extension>`. Commit the new
checksum-addressed source files, including notice captures, as existing font
sources are tracked there. Keep previous sources available for reproduction
and rollback. The convenience links under `cache/` are ignored.

Preserve extracted notices byte for byte, including line endings. Compare
changed licensing terms and upstream naming requirements before distributing
the replacement. For IPAmj, follow [IPAmj asset handling](ipamjm-licensing.md):
license attachment and README provenance are separate considerations, and the
shard/SVG classification questions remain unresolved.

## 2. Regenerate the affected family

Install npm dependencies from the lockfile with `npm ci`. Native regeneration
also needs the commands used by the selected script: Bash, `curl`, `shasum`,
`sort`, `join`, `unzip`, `gzip`, FontForge and/or `woff2_compress`.

Run the selected build command from the table. CJK Symbols and Adobe NotDef
convert OTF to WOFF2. IPAmj and Jigmo extract TTFs, compress them, retain the
notices and regenerate their glyph indexes with FontForge. The current Jigmo
script also checks for `woff2_compress`, even though its outputs are compressed
TTFs. Record the native tool versions used for the update.

For IPAmj/Jigmo, compare the decompressed old and new glyph indexes, not just
the gzip bytes. The CSV columns are `font_path,name,gid`. Review added/removed
Unicode and variation-sequence names, changed glyph IDs and glyph coverage.
Every font path and glyph ID must resolve against the matching new font;
regenerate the index whenever its font changes.

Check font metrics as well as outlines. For example:

```sh
fontforge -script scripts/dump_render_box.py src/fonts/ipamjm/ipamjm.ttf
```

For Jigmo, inspect all three TTFs. If metrics require adjustment, keep
`src/glyphwiki/renderIpamjmFont.ts` or `renderJigumoFont.ts` and the corresponding
`renderBox` in `scripts/generate-glyph-path-shards.mjs` consistent. Preserve or
adjust baseline corrections based on rendered output. Review Jigmo's
`glyphAliases` when new coverage makes an existing workaround unnecessary.

If filenames or family directories change, update their consumers:
`src/app/fonts.ts`, `src/app/[lang]/fonts.css`, the glyph renderers, shard
inputs, `next.config.ts` tracing, `scripts/prepare-license-page.mjs` and
`LICENSE.md`. Update version/hash statements in `docs/ipamjm-licensing.md`
when its referenced font or notices change.

## 3. Validate the local assets and output

Check that decompressed TTFs and extracted notices match the selected archive.
Gzip headers may change without a change to the underlying font or index;
compare decompressed contents when explaining binary differences.

Prepare the license page and run the existing release checks:

```sh
npm run prepare:license-page
npm run test:release-assets
```

Inspect the displayed notices and WOFF2 loading with the license browser spec:

```sh
MOJIDATA_API_BASE_URL='http://127.0.0.1:9/' npm run test:e2e:target -- \
  -- tests/e2e/license.spec.ts --project=chromium --no-deps
```

Separately render representative updated glyphs, added/removed characters,
variation sequences and missing-glyph cases. Verify the font/glyph selected,
geometry, baseline, clipping and fallback behavior. Check CJK Symbols' exclusion
of U+3000 and Adobe NotDef rendering when updating those webfonts. Compare local
font rendering with the regenerated shard output for IPAmj/Jigmo.

Keep validation API traffic on a local backend or the unused loopback URL above.
A request to a data page can query the separate D1 API even during font testing.
If the update affects data/API behavior or validation will use D1, follow the
[Mojidata D1 quota policy](https://github.com/mandel59/mojidata/blob/main/docs/d1-quota-policy.md)
before that work and record current cost evidence.

For the Cloudflare target, build against the intended immutable SPA release:

```sh
MOJIDATA_API_BASE_URL='http://127.0.0.1:9/' \
MOJIDATA_SPA_ASSET_RELEASE='<spa-release-id>' npm run cf:build:asset-worker
```

Use the existing database release for a font-only update. Verify original font
notices are present in server traces, webfonts load, and public artifacts pass
the font/shard guard. The license-page preparation and Cloudflare build are
both required checks for a font update.

## 4. Prepare private shards and a release plan

For an IPAmj/Jigmo update, generate the complete font set intended for the target
Worker into a fresh local directory. For example:

```sh
npm run cf:generate-glyph-path-shards -- \
  --source all --out '.glyph-path-shards/<font-release-id>'
```

`--source ipamjm` and `--source jigmo` are available for local comparisons.
Record input font/index hashes, output glyph/shard counts and compressed sizes.

Current generator, uploader and renderer use fixed `glyph-paths/v1/...` keys.
The renderer caches loaded shards for the life of the Worker instance. The
`--out` option only changes the local directory, not the R2 key namespace.
Replacing live objects in place can mix old and new geometry and removes the
old Worker's rollback inputs.

For a release with the current tooling, populate a separate **private** bucket
with the complete target shard set, then bind the preview Worker to that bucket
as `GLYPH_FONT_ASSETS`. Upload with:

```sh
npm run cf:upload-glyph-path-shards -- \
  --dir '.glyph-path-shards/<font-release-id>' --bucket '<private-release-bucket>'
```

Keep managed `r2.dev` access disabled and custom domains disconnected. The
uploader checks both settings before writing. A release-specific key prefix is
another option, but requires coordinated changes to the generator, uploader's
key validation and renderer; there is currently no prefix override flag.

Check SVG output through the preview's R2 binding before promotion. A WOFF2
URL is fingerprinted by the app build, whereas SVG API URLs are stable and have
browser/CDN caching. Define SVG URL versioning or cache invalidation for changed
images and confirm the new body/ETag, not just a successful response status.
Retain the previous Worker configuration and bucket for rollback.

## 5. Review and commit

Review `jj diff --git`. Include the source records/cache files, distribution
files, glyph indexes, original notices and any required renderer/configuration
changes in one coherent commit. Record coverage/outline changes, tool versions
and the checks performed. Use explicit Jujutsu filesets and the issue/model
trailers specified for the task.

Follow the requested scope for push, shard upload and deployment. For a release,
use [the Cloudflare deployment instructions](cloudflare.md), publish private
shards before promoting their consumer, and record the selected Worker/bucket,
validation results and rollback target in `docs/deployments/`.
