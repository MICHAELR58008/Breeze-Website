# Original User Request

## 2026-07-22T21:25:08Z

<USER_REQUEST>
Fix the Booking Drawer form so that transitioning to the final Review step (Step 5 of 5 or Step 6 of 6) never automatically triggers form submission, requiring an explicit user click on the final Submit button.

Working directory: c:\Users\SOL\Desktop\Projet for Breeze\wesite
Integrity mode: development

## Requirements

### R1. Prevent DOM Node Reuse & Accidental Submissions
Update `components/booking/booking-drawer.tsx` to give separate, explicit React `key` props (`key="continue-btn"` and `key="submit-btn"`) to the navigation buttons. Ensure that reaching the final step never auto-fires submission.

### R2. Explicit Button Submission
Ensure that form submission is bound strictly to an explicit click on the final submit button, completely preventing keyboard Enter bubbling or DOM node reuse from triggering API requests prematurely.

## Acceptance Criteria

### Verification
- [ ] Transitioning to the final Review step (on any service package, including Commercial Clean) keeps the drawer on the Review step without submitting automatically.
- [ ] Clicking the "Submit request" button explicitly on the final step successfully submits the form.
- [ ] `npx tsc --noEmit` passes with 0 errors.
- [ ] `npm run build` succeeds cleanly.
</USER_REQUEST>

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

## 2026-07-23T04:27:32Z

<USER_REQUEST>
Fix the secondary CTA phone button styling in the Hero section (`components/sections/hero.tsx`) so the phone number is clearly visible instead of obscured by a solid white background, and add direct TinaCMS inline editing support for `phoneNumber`.

Working directory: c:/Users/SOL/Desktop/Projet for Breeze/wesite
Integrity mode: development

## Requirements

### R1. Secondary CTA Button Contrast & Styling Fix
Update the phone CTA button next to "Get a free quote" in `components/sections/hero.tsx` so its background is transparent/glassmorphic (`bg-white/10 hover:bg-white/20 border-white/30 text-white`) and the phone text is crisp and readable.

### R2. TinaCMS Visual Editing Support for Phone Number
Add `data-tina-field={tinaField(props, "phoneNumber")}` to the phone CTA button in `components/sections/hero.tsx` so editors can click to edit the phone number directly in the TinaCMS visual editor.

## Verification Resources & Stack-Specific Tests
- **TypeScript Type Checker**: `npx tsc --noEmit` to ensure zero type errors in React/Next.js components.
- **ESLint Compliance**: `npm run lint` to enforce project code standards.
- **Next.js Production Build**: `npm run build` to verify full compilation without bundle or SSR errors.

## Acceptance Criteria

### Styling & Visual Contrast
- [ ] The phone CTA button next to "Get a free quote" in `components/sections/hero.tsx` displays white text on a transparent/subtle translucent background instead of a solid white block.
- [ ] Phone number text `(805) 760-8765` is clearly legible.

### TinaCMS Visual Editor
- [ ] The phone CTA button includes `data-tina-field={tinaField(props, "phoneNumber")}`.

### Stack-Specific Verification Tests
- [ ] `npx tsc --noEmit` completes with 0 type errors.
- [ ] `npm run lint` passes without errors.
- [ ] `npm run build` completes successfully with static/SSR route generation.
</USER_REQUEST>
