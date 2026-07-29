# Project: About Section Styling & Overlay Cleanup

## Mission
Remove the dark gradient overlay on the About section image block (`components/sections/about.tsx`) so the CEO photo renders 100% clean without dark gradient shadows or lines, while ensuring zero type errors (`npx tsc --noEmit`) and successful build (`npm run build`).

## Architecture & Code Layout
- Component under edit: `components/sections/about.tsx`
- Build config: `next.config.mjs`
- Layout & styling: Tailwind CSS, Next.js Image container wrapper

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | About Section Layout Alignment Fix | Root cause analysis & padding alignment | None | DONE |
| 2 | Remove Dark Gradient Overlay & Build Fix | Remove bottom gradient overlay elements/classes in `components/sections/about.tsx` and configure `serverExternalPackages: ['pg']` in `next.config.mjs` | M1 | DONE |

## Interface Contracts & Requirements
- R1: Remove the bottom gradient overlay (`bg-gradient-to-t from-black/80...` or similar overlay elements) and dark slate backdrop bleeding from the image block in `components/sections/about.tsx`.
- R2: Ensure the CEO image renders clearly from top to bottom with full container coverage, preserved focal point cropping, and zero dark overlay artifacts.
- Verification: `npx tsc --noEmit` returns 0 type errors, `npm run build` succeeds, `about.test.tsx` 19/19 tests pass, Forensic Auditor verdict is CLEAN.
