# Execution Mode Refactor Plan

## Goal

Refactor the app so that:

- canonical URLs stay `/search`, `/idsfind`, `/mojidata/{char}`
- `client-data` and `server-data` are explicit execution modes
- route families such as `*-spa` are treated as internal implementation detail
- core actions work without hydration
- UI and query logic are shared as much as possible across modes

This plan is intentionally phased. The first phases should improve structure without changing the public contract.

## Current State

### Public route shape

Canonical routes already exist:

- `/search`
- `/idsfind`
- `/mojidata/{char}`

Internal `*-spa` routes also exist:

- `/search-spa`
- `/idsfind-spa`
- `/mojidata-spa/{char}`

### Current coupling problem

Today, route family and execution mode are tightly coupled:

- canonical routes are treated as `server-data`
- `*-spa` routes are treated as `client-data`

That coupling leaks into:

- page components
- form behavior
- mobile layout behavior
- tests
- middleware rewrite assumptions

### Current performance problem

The current refactor improved structural separation, but it also introduced
two performance regressions for `server-data` routes:

- canonical pages now call `headers()` to select execution mode
- that makes the page entrypoints dynamic even when the actual content is
  suitable for caching
- server-data results are rendered inline, so the page shell often waits for
  the full result payload before streaming useful HTML

In practice this means:

- data caches may still hit
- but route-level caching is weaker than expected
- repeated visits can still feel like "full rerender"
- users do not see the page shell early enough during server-data rendering

### Existing shared pieces

These are already good building blocks:

- query parsing:
  - [`search.ts`](/Users/mandel59/ws/mojidata-web-app/src/app/[lang]/search/search.ts)
- result rendering:
  - [`IdsFindResponseView.tsx`](/Users/mandel59/ws/mojidata-web-app/src/components/IdsFindResponseView.tsx)
  - [`MojidataResponseView.tsx`](/Users/mandel59/ws/mojidata-web-app/src/app/[lang]/mojidata/[char]/MojidataResponseView.tsx)
- server execution:
  - [`idsfind.ts`](/Users/mandel59/ws/mojidata-web-app/src/app/[lang]/idsfind/idsfind.ts)
  - [`mojidata.ts`](/Users/mandel59/ws/mojidata-web-app/src/app/[lang]/mojidata/[char]/mojidata.ts)
- client execution:
  - [`mojidataApiBrowser.ts`](/Users/mandel59/ws/mojidata-web-app/src/spa/mojidataApiBrowser.ts)

### Main duplication hot spots

- search page shells:
  - [`search/page.tsx`](/Users/mandel59/ws/mojidata-web-app/src/app/[lang]/search/page.tsx)
  - [`search-spa/page.tsx`](/Users/mandel59/ws/mojidata-web-app/src/app/[lang]/search-spa/page.tsx)
- idsfind page shells:
  - [`idsfind/page.tsx`](/Users/mandel59/ws/mojidata-web-app/src/app/[lang]/idsfind/page.tsx)
  - [`idsfind-spa/page.tsx`](/Users/mandel59/ws/mojidata-web-app/src/app/[lang]/idsfind-spa/page.tsx)
- mojidata execution split:
  - [`MojidataResponse.tsx`](/Users/mandel59/ws/mojidata-web-app/src/app/[lang]/mojidata/[char]/MojidataResponse.tsx)
  - [`mojidataSpaClient.tsx`](/Users/mandel59/ws/mojidata-web-app/src/app/[lang]/mojidata-spa/[char]/mojidataSpaClient.tsx)
- repeated helpers:
  - normalization
  - URL generation
  - pagination href generation
  - mode-specific loading/error wrappers

## Target Model

### 1. Separate page shell from execution mode

Each canonical route should become a shell that can render either:

- `server-data` content directly
- `client-data` content through a client boundary

The shell should own:

- public URL semantics
- metadata
- form markup
- progressive enhancement baseline

### 2. Make execution mode explicit

Introduce an explicit mode selector, for example:

- `server-data`
- `client-data`

Mode selection should be driven by delivery policy, not by pathname shape.

### 3. Keep execution adapters small

Execution adapters should be thin wrappers over the current backends:

- server:
  - `mojidataApiApp.fetch(...)`
  - `unstable_cache(...)`
- client:
  - browser worker client
  - client-side cache / prefetch

### 4. Keep views mode-agnostic

Result view components should continue to receive plain props and remain ignorant of:

- worker setup
- server cache details
- route family

## Proposed Module Boundaries

The exact directory names can change, but the layering should look roughly like this:

### Shared search core

- `src/search/core/parseQuery.ts`
- `src/search/core/normalizeQuery.ts`
- `src/search/core/buildSearchRequest.ts`
- `src/search/core/buildPageHref.ts`

### Shared executors

- `src/search/executors/serverSearchExecutor.ts`
- `src/search/executors/clientSearchExecutor.ts`
- `src/mojidata/executors/serverMojidataExecutor.ts`
- `src/mojidata/executors/clientMojidataExecutor.ts`

### Shared route shells

- `src/features/search/SearchPageShell.tsx`
- `src/features/idsfind/IdsfindPageShell.tsx`
- `src/features/mojidata/MojidataPageShell.tsx`

### Shared result boundaries

- `SearchResultsServer.tsx`
- `SearchResultsClient.tsx`
- `IdsfindResultsServer.tsx`
- `IdsfindResultsClient.tsx`
- `MojidataResultsServer.tsx`
- `MojidataResultsClient.tsx`

These server/client pairs should be thin. Most rendering should stay in shared view components.

## Delivery Policy

Delivery policy should become its own concept.

At minimum, define a function or module that answers:

- which execution mode to use
- whether client assets should be prefetched
- whether links should assume server-only or canonical navigation

Example inputs:

- user agent class
- explicit override query param or cookie for debugging
- environment flags

This policy should live outside the page components.

For the next refactor phase, this becomes a hard requirement:

- request-header-based mode selection must happen in `proxy.ts`
- page components should not call `headers()` just to decide delivery mode
- canonical URLs should remain stable while internal route selection happens
  through rewrite

## Phase Plan

### Phase 1: Extract shared core helpers

No user-visible behavior change.

Tasks:

- move query normalization helpers out of page clients
- centralize pagination href builders
- centralize canonical path stripping / locale helpers where useful
- avoid duplicating `normalize(...)` logic across client and server search code

Expected result:

- less duplication
- easier to compare client-data and server-data flows

### Phase 2: Introduce explicit execution mode types

No public route change.

Tasks:

- add a shared `ExecutionMode` type
- add mode selection helper used by canonical route shells and proxy
- rename internal terminology in code from "SPA/non-SPA" to "client-data/server-data" where it refers to data execution

Expected result:

- code reviews can reason about mode separately from URL shape

### Phase 3: Unify canonical page shells

Small internal page refactor, still no public URL change.

Tasks:

- factor common layout from `search/page.tsx` and `search-spa/page.tsx`
- do the same for `idsfind`
- move form rendering into a common shell component
- keep `*-spa` routes as wrappers around the same shell if needed

Expected result:

- one place to fix mobile / accessibility / hydration-baseline issues

### Phase 4: Introduce executor-backed result boundaries

Tasks:

- define server/client executor interfaces for search and mojidata
- make canonical pages choose executor by explicit mode
- keep result views shared

Expected result:

- route family is no longer the source of truth for data execution

### Phase 5: Reduce reliance on internal `*-spa` routes

This phase is optional and should only happen after the earlier phases are stable.

Tasks:

- decide whether `*-spa` routes remain as internal entrypoints
- if retained, minimize their responsibilities
- if removable, migrate proxy/delivery logic to canonical shells only

Expected result:

- simpler route model

### Phase 6: Restore server-data performance characteristics

This phase is now the immediate priority.

Tasks:

- move default mode selection out of page components and back into `proxy.ts`
- let canonical pages default to `server-data` unless explicitly overridden
- use internal rewrite for `client-data` traffic instead of calling
  `headers()` from canonical pages
- add server-side `Suspense` boundaries so form/shell content can stream
  before result rendering completes
- preserve the existing `idsfind` full-result cache unless profiling proves it
  is the bottleneck

Expected result:

- canonical server-data pages become eligible for better route-level caching
- repeated requests stop paying avoidable dynamic-page cost
- shell markup appears before heavy result rendering completes

## Immediate Next Steps

The current implementation priority is:

1. update `proxy.ts` so delivery policy rewrites canonical requests to
   internal client-data routes when needed
2. remove `headers()`-based execution mode selection from canonical pages
3. add streaming boundaries for server-data result sections
4. verify the new behavior with build and focused E2E coverage

Do not start by deleting `*-spa` routes. They remain useful as internal
entrypoints while delivery policy is stabilized.

## Technical Risks

### RSC/client boundary friction

Server execution is naturally async RSC code. Client execution is naturally hook-based and depends on browser worker lifecycle. The boundary should remain explicit rather than forcing everything into one component tree.

### Cache asymmetry

Server execution uses `unstable_cache` and ISR semantics. Client execution uses in-memory browser caches and downloaded assets. The freshness model will not be identical.

### Worker/bootstrap cost

If `client-data` becomes the default for more clients, browser DB and worker startup cost will matter more. Prefetch strategy and lazy initialization need to be considered as part of delivery policy.

### Progressive enhancement discipline

If a core action is hidden behind a client-only affordance, the canonical route becomes brittle. The baseline markup must stay usable on its own.

### Test matrix growth

Tests should distinguish:

- canonical URL contract
- execution mode
- JS enabled vs disabled
- mobile vs desktop capability assumptions

Otherwise the suite will keep encoding incidental route-implementation details.

## Test Strategy

Add or rewrite tests around these invariants:

- canonical links always point to canonical URLs
- core actions work with JS disabled
- `client-data` and `server-data` produce compatible visible results
- middleware changes execution mode without changing the canonical contract

## Non-Goals For The First Refactor

- removing every `*-spa` route immediately
- redesigning the UI
- changing search semantics
- changing canonical URL shape
- replacing all UA-based logic in one step
