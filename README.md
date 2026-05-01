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
copies of `sql-wasm.wasm`, `moji.db`, and `idsfind.db` during development.

## Cloudflare Deployment

The operational Cloudflare deployment notes are in
[`docs/cloudflare.md`](docs/cloudflare.md).

Typical deployment flow:

```sh
npm run cf:upload-spa-assets -- --bucket <spa-assets-bucket>
npm run cf:generate-glyph-path-shards
npm run cf:upload-glyph-path-shards -- --bucket mojidata-glyph-font-assets
NEXT_PUBLIC_SPA_ASSET_BASE_URL='https://<spa-asset-origin>' npm run cf:build
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
