# Plan — Milestone 2: Error Boundary & Image Protection

## Objective
Fulfill user requirements:
1. Create a reusable Client Component Error Boundary (`components/ui/error-boundary.tsx`).
2. Wrap the `<Image />` component in `components/sections/about.tsx` with `<ErrorBoundary>`.
3. Ensure `npm run build` succeeds cleanly without TypeScript or React errors.

## Execution Steps

### Phase 1: Exploration & Architecture Analysis
- Spawn 3 Explorers (`teamwork_preview_explorer_m2_1`, `teamwork_preview_explorer_m2_2`, `teamwork_preview_explorer_m2_3`).
  - Explorer 1: Analyze React class component vs functional error boundary constraints in Next.js Client Components, standard Next.js / React fallback UI patterns, and `components/ui/` conventions.
  - Explorer 2: Analyze `components/sections/about.tsx` image usage, layout, and how to cleanly wrap `<Image />` with `<ErrorBoundary>` without breaking styles or responsive layout.
  - Explorer 3: Formulate exact code specifications for `components/ui/error-boundary.tsx` (props like `fallback`, `children`, `onReset`, state `hasError`, error details) and implementation plan for `about.tsx`.

### Phase 2: Implementation & Verification
- Spawn Worker (`teamwork_preview_worker_m2_1`) with Explorer recommendations.
  - Create `components/ui/error-boundary.tsx` with `"use client"`.
  - Update `components/sections/about.tsx` to import and wrap `<Image />` with `<ErrorBoundary>`.
  - Run `npx tsc --noEmit` and `npm run build`.

### Phase 3: Review & Empirical Testing
- Spawn 2 Reviewers (`teamwork_preview_reviewer_m2_1`, `teamwork_preview_reviewer_m2_2`) to check code quality, edge cases, fallback UI design, and type correctness.
- Spawn 2 Challengers (`teamwork_preview_challenger_m2_1`, `teamwork_preview_challenger_m2_2`) to empirically verify error boundary trapping (e.g., throwing synthetic rendering errors in children) and build clean state.

### Phase 4: Forensic Integrity Audit & Gate
- Spawn Forensic Auditor (`teamwork_preview_auditor_m2_1`) to verify authentic implementation without cheating, hardcoding, or facade components.
- If all pass: update `progress.md`, mark milestone DONE, and report victory to Sentinel.
