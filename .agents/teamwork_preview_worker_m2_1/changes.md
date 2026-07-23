# Summary of Changes

## Algorithmic Pricing Model Implementation

### 1. TinaCMS Schema Update (`tina/config.ts`)
- Modified the `services` collection under the `booking` schema in `tina/config.ts`.
- Removed the static `prices` array object definition.
- Added three new number fields:
  - `basePriceCents` (label: "Base Price (in cents)")
  - `pricePerBedroomCents` (label: "Price per Bedroom (in cents)")
  - `pricePerBathroomCents` (label: "Price per Bathroom (in cents)")

### 2. Dynamic Pricing Engine Update (`lib/pricing.ts` & `lib/booking-content.ts`)
- Updated `ServiceItemData` in `lib/pricing.ts` and `BookingService` in `lib/booking-content.ts`.
- Replaced `prices: PriceEntry[]` with `basePriceCents?: number`, `pricePerBedroomCents?: number`, and `pricePerBathroomCents?: number`.
- Updated `calculateEstimate()` logic in `lib/pricing.ts`:
  - Returns `null` if service ID is not found.
  - Returns `null` if `!svc.basePriceCents || svc.basePriceCents === 0` (indicating custom quote required).
  - Calculates formula: `basePriceCents + (bedrooms * pricePerBedroomCents) + (bathrooms * pricePerBathroomCents) + addOnsTotal`.

### 3. Data Migration (`content/booking/booking.json`)
- Updated services data in `content/booking/booking.json`:
  - `"deep"`: `basePriceCents: 13000`, `pricePerBedroomCents: 2000`, `pricePerBathroomCents: 3000` ($180 for 1 bed / 1 bath).
  - `"regular"`: `basePriceCents: 11000`, `pricePerBedroomCents: 1000`, `pricePerBathroomCents: 1500` ($135 for 1 bed / 1 bath).
  - `"Commercial "`: `basePriceCents: 0`, `pricePerBedroomCents: 0`, `pricePerBathroomCents: 0` (returns `null` -> Custom quote required).
- Removed legacy `prices` arrays from all service definitions.

### 4. UI / Landing Page Updates (`components/sections/services.tsx`)
- Updated `ServiceItem` interface in `components/sections/services.tsx`.
- Updated service pricing block to display base price, per-bedroom, and per-bathroom rate breakdowns (or "Custom Quote" when base price is 0).

### 5. Co-located Unit Tests (`lib/pricing.test.ts`)
- Added co-located unit test verifying `calculateEstimate` results for Deep, Regular, Commercial, and custom options.

### 6. Build and Verification
- Executed `npx tsc --noEmit`: 0 errors.
- Executed `npm run build`: Production build compiled and generated static pages successfully.
