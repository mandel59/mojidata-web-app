# Web license notice distribution review

Related: mandel59/mojidata#80. Reviewed on 2026-10-07 JST.

## Implemented

The app consumes Mojidata 1.9.2, IDSdb 1.8.1 and IDSdb-fts5 1.10.1.
The remaining npm lock entries and API implementation versions are unchanged.
Each package's data-notices manifest drives its nested notice assets. Preparation
checks package identity, required notice membership, safe paths and SHA-256
before copying. Original paths are retained under each package directory, so
relative links in the packaged LICENSE resolve alongside their notices.
Existing root notice URLs remain available.

The SPA inventory and immutable release manifest list all 132 raw, Brotli and
gzip objects. notices.packages records package identity/version, the data-notices
manifest, LICENSE and complete notice keys. MJ and CJKVI have direct notice keys.
The local asset route and asset Worker serve the nested notice paths; arbitrary
font/shard paths and traversal are excluded by the asset Worker. When a remote
SPA asset base is configured, Next redirects app /assets/* requests to that
release before filesystem routing. Local development without a remote base
continues to serve the prepared files from disk. The deployed Worker does not
rely on traced build directories being readable as runtime files.

The license page displays the original committed font notices and validated DB
notices in expandable sections. Preparation runs before dev/build and does not
need native font tools. Font bytes and indexes were not regenerated.

Glyph shard uploads verify r2.dev is disabled and no custom domains exist using
the pinned Wrangler CLI. Unreadable or unfamiliar responses stop before uploads.
Cloudflare builds check public inputs and final public assets for original
IPAmj/Jigmo files, shard paths and JSON outline dictionaries, including renamed
compressed dictionaries. Other Workers' future routing is outside this check;
review bindings when infrastructure changes.

## Validation

Six local tests cover notice copying/compression/release manifests, missing or
changed notice bytes, unsafe references, private-bucket checks, public outline
rejection and nested asset Worker redirects. Type checking and targeted JS/CSS
lint pass. A Chromium test against the production Next build opens IPA/OFL
license text and the GlyphWiki reuse excerpt, checks notice bytes and HEAD
metadata, loads the WOFF2 and verifies a raw-shard request is 404. Next/OpenNext full builds pass; original font notices
are byte-identical in the server bundle and public asset checks pass.

Live read-only bucket checks confirm r2.dev disabled and no custom domains.
Build/browser validation set the API URL to an unused loopback port, preventing
remote D1 requests. No remote DB validation or import is part of this work.

## D1 impact

Mojidata and FTS4 DB bytes are unchanged. FTS5 file bytes differ; the stored virtual-table declaration uses different
formatting. All eight ordinary and
FTS shadow tables, including data, postings and build metadata, have identical
row counts and canonical ordered-row hashes. Evidence is recorded in
2026-10-07-web-db-comparison.json. This is a browser-only package artifact;
server API packages, SQL, request fan-out and data API bindings are unchanged.
License routes/preparation and R2 metadata/object operations execute zero D1
reads/writes. The existing incremental cache prefix and API backend are retained.

## GlyphWiki source capture

Direct requests to the official Japanese and English pages returned HTTP 403
with Cloudflare challenge headers. A manually captured copy of the Japanese
wiki source text and its official URL was recorded on 2026-10-07 JST. The
data/article reuse license paragraph (including the quoted-material exception)
is retained as an explicitly labelled excerpt in
src/licensing/glyphwiki/license.txt with its SHA-256 and provenance in source.json.
The source is recorded as [revision @18](https://glyphwiki.org/wiki/GlyphWiki:%e3%83%87%e3%83%bc%e3%82%bf%e3%83%bb%e8%a8%98%e4%ba%8b%e3%81%ae%e3%83%a9%e3%82%a4%e3%82%bb%e3%83%b3%e3%82%b9@18)
(page timestamp: 2025-09-03 12:12). Preparation checks the hash and the app displays
the excerpt and revision-specific official source link. Contributor instructions
are omitted. The recorded revision was identified after capture; this manually
captured copy has not been independently compared against that revision.

TGHB government-primary-source regeneration remains a separate upstream
improvement.
