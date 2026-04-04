# Style Guide

This repository now uses three styling layers.

## 1. App-wide CSS

Files:

- [`src/app/[lang]/fonts.css`](/Users/mandel59/ws/mojidata-web-app/src/app/[lang]/fonts.css)
- [`src/app/[lang]/theme.css`](/Users/mandel59/ws/mojidata-web-app/src/app/[lang]/theme.css)
- [`src/app/[lang]/base.css`](/Users/mandel59/ws/mojidata-web-app/src/app/[lang]/base.css)

Keep only truly global concerns here:

- font faces
- CSS variables / design tokens
- browser reset / base element behavior

Do not add feature-specific layout or component chrome here.

## 2. Shared component tokens

File:

- [`src/components/Surface.module.css`](/Users/mandel59/ws/mojidata-web-app/src/components/Surface.module.css)

Use this module for repeated primitives such as:

- white or muted surfaces
- card and frame radii
- shared padding scales
- pill chrome
- text field chrome
- focus ring behavior
- shared hover/focus tokens

Prefer combining shared surface classes in TSX rather than using CSS Modules `composes`.

Example:

```tsx
className={cn(surfaceStyles.cardSurface, surfaceStyles.radiusCard, styles.panel)}
```

Leave only component-specific layout or typography in the local module.

## 3. Feature / component CSS Modules

Each feature or component module should own:

- local layout
- local spacing relationships
- local typography choices
- local state styling that is not reused elsewhere

Before adding a new border, background, radius, or focus ring rule, check whether an equivalent already exists in `Surface.module.css`.

## Rules of thumb

- If a style is reused in 3 or more places, consider moving it into `Surface.module.css`.
- If moving a rule would hide important layout intent, keep it local.
- Keep visual regressions locked with the visual suites before and after refactors.
- Prefer `data-testid` for tests over legacy presentational class names.

## Verification workflow

Before and after structural CSS cleanup:

- run `npm run visual:compare` for app screenshots
- run `npm run storybook:smoke` for isolated component rendering
- run `npm run storybook:visual` for isolated component screenshots
- run `npm run verify:style-system` when you want the full style verification path

`visual:compare` covers the app-level baseline.
`storybook:smoke` is the component-level render guardrail.
`storybook:visual` is the component-level screenshot baseline.
