# IPAmj asset handling

Related: mandel59/mojidata#80. Reviewed on 2026-10-07 JST.

## Original font and notices

IPAmjMincho Ver.006.01 is an IPA Font License v1.0 resource, separate from the
application's MIT-licensed source code. The supplied original archive matches
`download.txt`: `ipamjm00601.zip`, SHA-256
`35494e0f2896f38b3f7369a8421a895cea6440a42c0a66ac95eab47d6ed25b68`.

The font in the archive is byte-identical to the decompressed
`src/fonts/ipamjm/ipamjm.ttf.gz`. Its MD5 is
`BEEE256D4FFEC4C40493805A4D7E5CDD`, matching the
[official Ver.006.01 declaration](https://moji.or.jp/mojikiban/font/).
Compression wraps the original TTF without changing its name or contents.

The original files are retained byte for byte, including line endings, beside
that font:

- `IPA_Font_License_Agreement_v1.0.txt` (Japanese and English), SHA-256
  `4c84dd528ec3044638ec346fc1ee27cd1eb95dfc04cbc6a881b3ca7a7f517e54`.
- `Readme.txt`, SHA-256
  `c4e00811e8a10572707535cf9edcf67e6bf15e229262c82062196efce452c57c`.

`scripts/build-font-ipamjm` extracts all three archive members and stops if a
required member is missing. Existing `outputFileTracingIncludes` covers
`src/fonts/ipamjm/**`, so these notices are included with the font in newly
built server traces. The font and notices are not added to `public/`.
When distributing the original font or a server bundle containing it, retain
these notices; a link alone does not satisfy the license-copy attachment
requirement in Article 3 Paragraph 2.

## Internal outline shards

`scripts/generate-glyph-path-shards.mjs` extracts normalized outlines from the
original font into gzip-compressed JSON dictionaries. Treat these as IPA-derived
assets that may qualify as a Derived Program under Article 1 Paragraph 3;
do not assign them the application's MIT license or CC0.

The project's interpretation is that Article 2 Paragraph 7 permits creating,
using and reproducing such assets for server-side operation. The additional
conditions in Article 3 Paragraph 1 apply when a Derived Program is redistributed.
The service keeps the shards in controlled infrastructure and returns rendered
images to end users. An operator distributing shards or a bundle containing
them to other recipients must review that redistribution separately.

## SVG output

The API selects one glyph and returns a fixed SVG image containing path geometry.
It does not return a font program, reusable glyph dictionary, or embedded font.
The project treats this output as Digital Content under Article 1 Paragraph 4
and Article 2 Paragraphs 2 and 3. The
[official FAQ](https://moji.or.jp/ipafont/faq/) section 5.2 permits server-generated
character images; its SVG embedding example in section 4.1 concerns a different
mechanism. The FAQ does not specifically classify this JSON-shard implementation,
so this document records the project's interpretation, not an official ruling.

## Operational boundaries

As checked on 2026-10-07, `mojidata-glyph-font-assets` has its managed `r2.dev`
URL disabled and no custom domains. Of the eight Workers inspected, only the
production and staging app Workers bind this bucket as `GLYPH_FONT_ASSETS`.
An authenticated read of `glyph-paths/v1/ipamjm/u34.json.gz` succeeds; anonymous
access to its managed-domain URL returns 401. The app's representative raw-shard
and font paths return 404, while `/api/ipamjm/svg/u3402` returns an SVG with 200.
The inspected public build artifacts contain no raw shards or font files.

Keep both R2 public access methods disabled. Keep generated shards out of
`public/`, `.open-next/assets`, browser chunks and SPA/CDN uploads. Return only
individual images from the SVG API. Before uploading to another bucket or
changing asset routing, recheck these boundaries. The current upload and build
scripts do not automatically enforce all of these boundaries; automated guards
remain separate follow-up work.

If shards are ever redistributed, Article 3 Paragraph 1 requires the IPA license,
permitted naming, a way to replace the derived program with the original font,
and the required additional modification files. Such a release needs a separate
review before enabling public access.

## Validation and deployment scope

The archive hash, both original notice hashes and original/current TTF bytes
were verified locally. The build script was exercised in an isolated fixture
with the supplied archive; extracted notices and decompressed TTF match the
archive exactly. Download and index generation were stubbed; the real extraction
and gzip steps ran. Fixtures missing either notice are rejected before the index
step. Both notice paths match the existing Next server tracing include glob;
a complete Next/OpenNext rebuild was not run for this metadata-only change.

This notice/documentation change leaves the font, index, outline generator,
rendering code, queries and data unchanged. It performs no D1 operation or remote
upload/deployment. Existing deployed bundles are not changed by this commit;
new server builds must retain the notices with their bundled font.
