# ARCHITECTURE

## Core Model

This project has two largely independent axes:

1. URL / rendering shell
2. Data execution mode

These must not be conflated.

### Canonical public routes

The public URLs are canonical and stable:

- `/search`
- `/idsfind`
- `/mojidata/{char}`

End users and crawlers should be linked to these canonical routes.

### Data execution modes

There are two execution modes for search / lookup:

- `server-data`
  - DB search and mojidata lookup run on the server.
  - Suitable for indexing bots and constrained clients.
  - Compatible with ISR / server caching.
- `client-data`
  - DB search and mojidata lookup run in the browser.
  - Suitable for capable desktop clients and similar environments.
  - May use browser workers, client caches, and downloaded DB assets.

Historically this project called the `client-data` path "SPA", but that term is only a rough shorthand. The important distinction is where data processing runs, not whether some page happens to hydrate.

## Design Goals

- Keep canonical URLs independent from execution mode.
- Allow the same canonical route to run in either `server-data` or `client-data`.
- Prefer shared UI between modes whenever possible.
- Keep major user actions functional before hydration.
- Treat JavaScript-only behavior as enhancement, not as the only entry point for core actions.

## Delivery Policy

Execution mode is selected as a delivery policy, not as a public route contract.

Current policy target:

- capable desktop clients: prefer `client-data`
- constrained clients: prefer `server-data`
- indexing bots: prefer `server-data`
- other automated clients: choose intentionally; do not rely on accidental behavior

UA-basedq rewriting is only one implementation tool for this policy. It is not the architecture itself.

## Route Model

### Canonical routes

Canonical routes own:

- public URL shape
- metadata / canonical links
- server-rendered HTML shell
- progressive enhancement baseline

### Internal client-data entrypoints

Routes such as `/search-spa`, `/idsfind-spa`, and `/mojidata-spa/{char}` are internal implementation entrypoints for `client-data` mode.

They are not part of the public URL model.

If middleware/proxy rewrites a canonical route to one of these paths, that rewrite is an internal delivery detail.

## Responsibility Boundaries

### Shared across modes

These should be shared as aggressively as possible:

- query parsing and normalization
- request parameter parsing
- URL building and pagination href generation
- result view components
- mojidata display components
- fallback-friendly form markup

### Mode-specific

These are expected to differ:

- DB/search execution backend
- caching strategy
- initial loading behavior
- asset prefetch / worker initialization

## UI Policy

Core user actions must work without requiring hydration:

- submitting search forms
- changing pages
- following result links
- opening canonical detail pages

Hydration may enhance the experience, but must not be the only way to perform these actions.

Examples of acceptable enhancement:

- drawers
- modal dialogs
- client-side copy helpers
- richer loading states
- prefetching

Examples of risky design:

- hiding the only usable form behind a client-only drawer
- making pager navigation depend on client-side router actions
- relying on `onClick` alone when a normal `href` or form submit is available

## Refactoring Direction

The intended refactor direction is:

1. Separate "which route is requested" from "where data processing runs".
2. Keep canonical pages as the primary page shells.
3. Introduce explicit execution-mode selection (`server-data` vs `client-data`).
4. Move shared query / URL / result-view logic into common modules.
5. Treat client-only UI as progressive enhancement layered on top of a working baseline.

## Review Checklist

- [ ] Canonical URLs remain `/search`, `/idsfind`, `/mojidata/{char}`.
- [ ] Execution mode is treated as an internal concern, not a public URL contract.
- [ ] Core actions work without hydration.
- [ ] Shared logic is not duplicated across server-data and client-data paths without reason.
- [ ] Mode-specific code is limited to execution, caching, and enhancement concerns.
