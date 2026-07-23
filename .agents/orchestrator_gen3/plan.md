# Execution Plan — Booking Sheet Algorithmic Pricing Restructuring

## Objectives
Restructure the Booking Sheet calculator to use an Algorithmic Pricing Model:
`Price = Base Price + (Bedrooms * PricePerBedroom) + (Bathrooms * PricePerBathroom) + AddOnsTotal`
configured per package/service in TinaCMS, replacing grid matching while supporting custom quotes when base price is omitted or 0.

## Milestones

### Milestone 1: Exploration & Codebase Analysis
- **Goal**: Dispatch 3 Explorer subagents to examine:
  1. `tina/config.ts` — TinaCMS schema for booking services and package fields.
  2. `lib/pricing.ts` & `lib/booking-content.ts` — `calculateEstimate()` function and type definitions.
  3. `content/booking/booking.json` — Existing service data structure for `deep`, `regular`, and `Commercial `.
  4. Any UI components consuming `calculateEstimate()` or service prices (e.g. `components/booking/booking-drawer.tsx`, etc.).
- **Deliverable**: Analysis reports detailing precise changes needed.

### Milestone 2: Schema, Pricing Logic, & Data Migration Implementation
- **Goal**: Dispatch a Worker subagent to implement:
  - **R1**: Update `tina/config.ts` replacing `prices` array field on services with `basePriceCents`, `pricePerBedroomCents`, `pricePerBathroomCents`.
  - **R2**: Update `lib/pricing.ts` and `lib/booking-content.ts` so `calculateEstimate()` calculates dynamic price using `basePriceCents + (bedrooms * pricePerBedroomCents) + (bathrooms * pricePerBathroomCents) + addOnsTotal`. If `basePriceCents` is omitted/0/undefined, return `null` ("Custom quote required").
  - **R3**: Update `content/booking/booking.json` migrating existing services (`deep`, `regular`, `Commercial `) to algorithmic schema attributes.
  - Run build verification (`npx tsc --noEmit` and `npm run build`).

### Milestone 3: Review, Challenge & Forensic Audit Verification
- **Goal**: Dispatch Reviewer, Challenger, and Forensic Auditor subagents to verify:
  - 0 TypeScript errors (`npx tsc --noEmit`).
  - Clean Next.js build (`npm run build`).
  - Accurate price calculations and proper handling of custom quotes (null return).
  - Clean forensic integrity audit verdict.

## Deliverables
- Restructured `tina/config.ts`
- Updated `lib/pricing.ts` & `lib/booking-content.ts`
- Migrated `content/booking/booking.json`
- Passing build and clean audit report.
