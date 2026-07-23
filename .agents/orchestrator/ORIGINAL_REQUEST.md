# Original User Request

## 2026-07-22T21:25:16Z

You are the Project Orchestrator for the task defined in `c:\Users\SOL\Desktop\Projet for Breeze\wesite\.agents\ORIGINAL_REQUEST.md`.

Your working directory for metadata/plans/progress is `c:\Users\SOL\Desktop\Projet for Breeze\wesite\.agents\orchestrator`.
The project root directory is `c:\Users\SOL\Desktop\Projet for Breeze\wesite`.

### Task Summary
Fix the Booking Drawer form so that transitioning to the final Review step (Step 5 of 5 or Step 6 of 6) never automatically triggers form submission, requiring an explicit user click on the final Submit button.

### Specific Requirements
1. R1. Prevent DOM Node Reuse & Accidental Submissions: Update `components/booking/booking-drawer.tsx` to give separate, explicit React `key` props (`key="continue-btn"` and `key="submit-btn"`) to the navigation buttons. Ensure that reaching the final step never auto-fires submission.
2. R2. Explicit Button Submission: Ensure that form submission is bound strictly to an explicit click on the final submit button, completely preventing keyboard Enter bubbling or DOM node reuse from triggering API requests prematurely.

### Acceptance Criteria
- Transitioning to the final Review step (on any service package, including Commercial Clean) keeps the drawer on the Review step without submitting automatically.
- Clicking the "Submit request" button explicitly on the final step successfully submits the form.
- `npx tsc --noEmit` passes with 0 errors.

## 2026-07-22T23:59:05Z

<USER_REQUEST>
Implement a React Error Boundary around the image in the About section (`components/sections/about.tsx`) to prevent rendering/loading failures from crashing the page.

Working directory: c:/Users/SOL/Desktop/Projet for Breeze/wesite
Integrity mode: development

## Requirements

### R1. UI Error Boundary Component
Create a reusable Client Component Error Boundary (`components/ui/error-boundary.tsx`) that catches rendering errors in child components and displays a clean fallback UI.

### R2. Protect Image in About Section
Wrap the `<Image />` component inside `components/sections/about.tsx` with the newly created Error Boundary so image errors are safely isolated.

## Acceptance Criteria

### Component Implementation
- [ ] `components/ui/error-boundary.tsx` exists and uses `"use client"`.
- [ ] The Error Boundary catches child component render errors and displays a fallback UI instead of crashing the page.

### Integration
- [ ] `components/sections/about.tsx` wraps the `<Image />` component with `<ErrorBoundary>`.
- [ ] The app builds cleanly without TypeScript or React errors (`npm run build`).
</USER_REQUEST>

