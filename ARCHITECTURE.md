# ARCHITECTURE

## Route Model: SPA vs non-SPA

This project intentionally has two route families.

### non-SPA routes (server-oriented)
- `/search`
- `/idsfind`
- `/mojidata/{char}`

### SPA routes (client-oriented)
- `/search-spa`
- `/idsfind-spa`
- `/mojidata-spa/{char}`

## Responsibilities

### non-SPA routes
- Keep search/lookup processing server-side.
- Do not require clients to download large DB payloads for local search.
- Preferred for constrained clients (e.g. mobile data/CPU constraints).

### SPA routes
- May prefetch/download assets/data for client-side interaction.
- Can use richer client-side caching/state patterns.

## Hard Rule

Do **not** replace non-SPA server search flow with SPA client search logic.

In practice:
- `/search` must continue using server-side response flow (e.g. server `IdsFindResponse` path), not `SearchSpaClient`.
- Similar separation should be preserved for IDS and mojidata pages.

## UI Alignment Policy

- Visual consistency between SPA and non-SPA is encouraged (layout, spacing, components).
- Data-processing model must remain separated as above.
- If refactoring shared UI, verify no cross-over of processing responsibilities.

## Review Checklist (for PRs)

- [ ] non-SPA routes still use server-side search/lookup.
- [ ] SPA routes still encapsulate client-side search/lookup behavior.
- [ ] UI changes do not alter route responsibility boundaries.
- [ ] Mobile behavior changes were checked on both SPA and non-SPA routes.
