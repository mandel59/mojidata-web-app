# Mojidata Web App

Mojidata Web App is a Next.js application for browsing and searching the
Mojidata kanji information databases.

Production runs on Cloudflare Workers with OpenNext at
`https://mojidata.ryusei.dev/`. Server-rendered routes query a separate
D1-backed API Worker from the `mojidata` repository. Browser-only SPA routes
load their database and WebAssembly assets from R2 instead of bundling them into
the Worker deployment.

## Development

Install dependencies and start the Next.js development server:

```sh
npm install
npm run dev
```

Open `http://localhost:3000` and use `/search` as the main entrypoint.

`npm run dev` runs `prepare:spa-assets` first, so the SPA routes can use local
copies of `sqlite3.wasm`, fallback `sql-wasm.wasm`, `moji.db`, FTS4
`idsfind.db`, and FTS5 `idsfind-fts5.db` from `dist/spa-assets` during
development.

Type checking with `npx tsc --noEmit` uses TypeScript 7 via the
`@typescript/native` npm alias. The `typescript` dependency aliases the official
`@typescript/typescript6` compatibility package for tools that require the
JavaScript compiler API, including ESLint and Storybook. See the
[TypeScript side-by-side setup](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0).
ESLint stays on the latest 9.x release until the React, accessibility, and import
plugins used by `eslint-config-next` support ESLint 10.

## Font assets

Each font family has its own directory under `src/fonts/`: `cjksymbols`,
`notdef`, `jigmo` and `ipamjm`. The WOFF2 or compressed TTF files and original
license/README files are committed together, so normal development and builds
use these assets immediately after installing npm dependencies. Font notices
are also included in server traces; [`LICENSE.md`](LICENSE.md) links to them.

The `scripts/build-font-*` commands refresh the fonts and their notices from
checksum-verified sources recorded in `download.txt`. CJK Symbols and Adobe
NotDef use `woff2_compress`; Jigmo and IPAmj index generation use FontForge.
Commit regenerated distribution files and notices together. Temporary OTF and
uncompressed TTF files are ignored.

## Cloudflare Deployment

The operational Cloudflare deployment notes are in
[`docs/cloudflare.md`](docs/cloudflare.md).

Typical deployment flow:

```sh
export MOJIDATA_SPA_ASSET_RELEASE='<release-id>'
npm run cf:upload-spa-assets -- --bucket <spa-assets-bucket>
npm run cf:generate-glyph-path-shards
npm run cf:upload-glyph-path-shards -- --bucket mojidata-glyph-font-assets
npm run cf:build:asset-worker
npm run cf:deploy
```

Run `npm run cf:typegen` after changing `wrangler.jsonc`.

## SPA Routes vs Non-SPA Routes

This app has both **SPA** and **non-SPA** route sets.

- non-SPA:
  - `/search`
  - `/idsfind`
  - `/mojidata/{char}`
- SPA:
  - `/search-spa`
  - `/idsfind-spa`
  - `/mojidata-spa/{char}`

### Key Difference

- **non-SPA routes** use server-side processing for search and lookup.
- **SPA routes** load data and assets in the browser and perform more
  client-side processing.

### Important Policy

Do **not** switch non-SPA routes to SPA client search logic.
In particular, `/search` should keep using the server-side search flow, not
`SearchSpaClient`, so mobile clients are not forced to download and search large
database payloads locally.

### UI Policy

UI can be aligned between SPA and non-SPA routes, including layout, spacing, and
components, but the data-processing model above must remain unchanged.
