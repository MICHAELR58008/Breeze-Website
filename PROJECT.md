# Project: Booking Sheet Algorithmic Pricing Model Restructuring

## Architecture
- **TinaCMS Config (`tina/config.ts`)**: Defines schema for booking content, specifically services/packages. Replaces `prices` array grid with `basePriceCents`, `pricePerBedroomCents`, and `pricePerBathroomCents`.
- **Pricing Calculation Logic (`lib/pricing.ts` & `lib/booking-content.ts`)**: Implements dynamic pricing calculation:
  `Price = basePriceCents + (bedrooms * pricePerBedroomCents) + (bathrooms * pricePerBathroomCents) + addOnsTotal`. Returns `null` if `basePriceCents` is missing/0/undefined (triggering "Custom quote required").
- **Booking Content Data (`content/booking/booking.json`)**: JSON storage for services (`deep`, `regular`, `Commercial `).
- **UI Components (`components/booking/*`, `components/sections/services.tsx`)**: Render estimate dollar amount or "Custom quote required" when calculation returns null.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Analysis | Codebase investigation of schema, pricing logic, data, and UI components | None | DONE |
| 2 | Implementation & Migration | Schema update, pricing function rewrite, JSON content migration | M1 | DONE |
| 3 | Verification & Audit | TypeScript validation, Next.js build, dynamic pricing tests, forensic audit | M2 | DONE |

## Code Layout
- `tina/config.ts`: TinaCMS schema definitions (`basePriceCents`, `pricePerBedroomCents`, `pricePerBathroomCents`)
- `lib/pricing.ts`: Pricing calculation engine (`calculateEstimate`)
- `lib/booking-content.ts`: Booking content types & interfaces (`BookingService`)
- `content/booking/booking.json`: Booking services & package content (`deep`, `regular`, `Commercial `)
- `components/booking/booking-drawer.tsx`: Booking drawer UI component with `<EstimateCallout />`
- `components/sections/services.tsx`: Service package price display component
