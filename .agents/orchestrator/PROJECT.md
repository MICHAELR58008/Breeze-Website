# Project: Proof Badges Inline Editing & Opacity Control

## Scope
1. Enable inline editing for Proof Text (`value` and `label`) by passing and applying `data-tina-field` attributes in `components/sections/shared.tsx` and `components/sections/hero.tsx`.
2. Add "Proof Background Opacity" schema control to the Hero section in `tina/config.ts` and apply dynamic opacity styling to proof badges in `components/sections/hero.tsx`.
3. Verify changes with `npx tsc --noEmit`, `npm run lint`, and `npm run build`.

## Architecture
- `components/sections/shared.tsx`: Contains shared UI components including `Proof` badge component.
- `components/sections/hero.tsx`: Hero section component rendering `Proof` badges with Tina CMS annotations.
- `tina/config.ts`: TinaCMS schema configuration.

## Requirements
- R1: Update `Proof` component (`components/sections/shared.tsx`) and `Hero` component (`components/sections/hero.tsx`) to pass/apply `data-tina-field` attributes to `value` and `label` elements for inline TinaCMS editing.
- R2: Update `tina/config.ts` (hero section schema) to add a number control for proof background opacity, and update `components/sections/hero.tsx` to dynamically apply opacity.
- R3: Complete build and type checks: `npx tsc --noEmit`, `npm run lint`, `npm run build`.

## Acceptance Criteria
- [x] In TinaCMS visual editor, clicking on "value" or "label" text of proof badges focuses the field for inline editing.
- [x] TinaCMS sidebar includes background opacity control for proof badges that dynamically updates live preview.
- [x] `npx tsc --noEmit` completes with 0 errors.
- [x] `npm run lint` completes with 0 errors.
- [x] `npm run build` completes cleanly.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Proof Badges Inline Editing & Opacity Control | `components/sections/shared.tsx`, `components/sections/hero.tsx`, `tina/config.ts` | none | DONE |
