# IPAmj asset handling

Related: mandel59/mojidata#80. Reviewed on 2026-10-07 JST.

This document distinguishes express license conditions, official FAQ guidance,
unresolved classification questions, and conservative project policy. Unresolved
questions are not treated as license prohibitions.

## Original font and notices

IPAmjMincho Ver.006.01 is licensed under IPA Font License v1.0, separately from
the application's MIT-licensed source code.

The supplied archive is `ipamjm00601.zip`, SHA-256:

`35494e0f2896f38b3f7369a8421a895cea6440a42c0a66ac95eab47d6ed25b68`

The archived font is byte-identical to decompressed
`src/fonts/ipamjm/ipamjm.ttf.gz`. Its MD5 is
`BEEE256D4FFEC4C40493805A4D7E5CDD`, matching the
[official Ver.006.01 declaration](https://moji.or.jp/mojikiban/font/).

The following upstream files are retained byte for byte:

- `IPA_Font_License_Agreement_v1.0.txt`, SHA-256
  `4c84dd528ec3044638ec346fc1ee27cd1eb95dfc04cbc6a881b3ca7a7f517e54`
- `Readme.txt`, SHA-256
  `c4e00811e8a10572707535cf9edcf67e6bf15e229262c82062196efce452c57c`

`scripts/build-font-ipamjm` extracts all three files and fails if one is
missing. Existing `outputFileTracingIncludes` keeps them in server traces.
They are not placed in `public/`.

## Redistribution conditions

When redistributing the unchanged font to third parties, Article 3 Paragraph 2
requires preserving its name and contents and attaching the IPA Font License.
A link alone does not satisfy Paragraph 2(3). This also applies to a
font-containing server bundle redistributed to third parties, not to internal
deployment.

`Readme.txt` is retained as project provenance policy, not as a requirement of
Article 3 Paragraph 2.

If an asset is classified as a Derived Program, Article 3 Paragraph 1 applies
on redistribution. Its conditions include:

- making a copy of the Derived Program available as specified in Paragraph 1(1);
- providing a means to replace it with the Original Program;
- licensing it under the IPA Font License;
- complying with the naming restriction.

Paragraph 1(1)(b) applies only if qualifying additional modification files
already exist. It does not require creating such files.

Paragraph 1(1) allows the required material to be provided with the Derived
Program, online, or by mailing a medium within the stated cost limit.

See the
[retained license text](../src/fonts/ipamjm/IPA_Font_License_Agreement_v1.0.txt)
and [official license](https://moji.or.jp/ipafont/license/).

## Internal outline shards

`scripts/generate-glyph-path-shards.mjs` extracts normalized outlines into
gzip-compressed JSON dictionaries.

Whether a standalone shard is a Derived Program under Article 1 Paragraph 3 is
unresolved. The project therefore does not assign MIT or CC0 terms to the
extracted outlines.

The shards are private intermediate assets used for server-side rendering. If
they, or a bundle containing them, are to be redistributed to third parties,
the possible application of Article 3 must be reviewed first.

This is conservative project policy, not a determination that every shard is a
Derived Program or that shard redistribution is prohibited.

## SVG output

Each API response contains one glyph as an SVG image with path geometry. It
does not contain the original TTF or the internal shard representation.

Clients can nevertheless collect many responses and reconstruct reusable glyph
data or font-like assets. A one-glyph response format does not prevent this.

FAQ 5.2 treats server-generated character images as Digital Content rather than
font redistribution. Based on that guidance, the project treats each SVG
response as Digital Content under Article 1 Paragraph 4 and Article 2
Paragraphs 2 and 3.

This is a project interpretation, not an official classification of this API.

Neither the license nor the FAQ clearly states whether aggregate retrieval of
many glyph images changes the classification of the service or its output, or
how reconstructed assets should be treated. FAQ 4.1 concerns fonts embedded in
a particular SVG document and does not resolve this case.

## Technical policy

As checked on 2026-10-07:

- the `mojidata-glyph-font-assets` bucket has no public `r2.dev` URL or custom
  domain;
- only production and staging app Workers bind it as `GLYPH_FONT_ASSETS`;
- authenticated shard reads succeed, while anonymous raw-asset access does not;
- `/api/ipamjm/svg/u3402` returns SVG successfully;
- inspected public build artifacts contain no raw font files or shards.

Keep raw font files and internal bulk outline representations out of public
assets, browser bundles, SPA/CDN uploads, and directly accessible R2 routes.

Keep the public SVG API limited to per-glyph image responses rather than
exposing internal shard or bulk font representations.

Before changing bucket routing, bindings, or asset publication, recheck these
boundaries. Existing scripts fail closed when relevant R2 public-access settings
are enabled, unknown, or unreadable, and builds reject known raw font/shard
paths in public artifacts.

These controls reduce direct exposure of the original font files and internal
bulk outline data. They do not prevent collection or reconstruction of SVG
responses and do not create a legal safe harbor for per-glyph delivery.

Any proposal to redistribute raw shards requires separate review before public
access is enabled.

## Validation scope

The archive hash, upstream notice hashes, and original/current TTF bytes were
verified locally.

The build script was exercised in an isolated fixture. Extraction and gzip
steps ran normally; download and index generation were stubbed. Missing notice
files are rejected.

Both notice paths match the existing Next server tracing include glob. Full
build verification is recorded in the
[license notice deployment record](deployments/2026-10-07-license-notices/README.md).
