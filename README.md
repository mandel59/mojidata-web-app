This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

[http://localhost:3000/api/hello](http://localhost:3000/api/hello) is an endpoint that uses [Route Handlers](https://beta.nextjs.org/docs/routing/route-handlers). This endpoint can be edited in `app/api/hello/route.ts`.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## SPA routes vs non-SPA routes

This app has both **SPA** and **non-SPA** route sets.

- non-SPA:
  - `/search`
  - `/idsfind`
  - `/mojidata/{char}`
- SPA:
  - `/search-spa`
  - `/idsfind-spa`
  - `/mojidata-spa/{char}`

### Key difference

- **non-SPA routes** use server-side processing for search/lookup.
- **SPA routes** can load data/assets in the browser and perform more client-side processing.

### Important policy

Do **not** switch non-SPA routes to SPA client search logic.
In particular, `/search` should keep using server-side search flow (not `SearchSpaClient`) so mobile clients are not forced to download/search large DB payloads locally.

### UI policy

UI can be aligned between SPA and non-SPA routes (layout, spacing, components),
but the data-processing model above must remain unchanged.
