# Handoff Report — TinaCMS Pricing & Booking Data Loading Refactor Analysis

## 1. Observation

- **`lib/pricing.ts`**:
  - Contains `fetchPricingContent()` (lines 33-51) executing `(client.queries as any).pricing({ relativePath: "pricing.json" })`.
  - Imports static `sitePricing` from `@/content/pricing/pricing.json` (line 1) and exposes static helpers `calculateEstimate()` (lines 90-107) and `findService()` (lines 63-65).
  - Note: `calculateEstimate()` calculates estimates using the static `sitePricing` file rather than CMS-updated dynamic pricing data.

- **`lib/booking-content.ts`**:
  - Contains `fetchBookingContent()` (lines 148-168) executing `(client.queries as any).booking({ relativePath: "booking.json" })`.
  - Normalizes raw Tina data with fallback defaults in `normalizeBookingData(raw)` (lines 170-228).

- **`app/page.tsx`**:
  - Server Component calls 3 separate async queries: `fetchPageData()`, `fetchBookingContent()`, `fetchPricingContent()` (lines 9-11).
  - Wraps tree in `<BookingProvider>` passing `content`, `tina`, `pricingContent`, `pricingTina` (lines 14-19).

- **`components/booking/booking-drawer.tsx`**:
  - `BookingProviderTinaWrapper` calls `useTina` **twice** concurrently (lines 116-120 and lines 122-126).
  - Derives `servicesList` and `addOnsList` from `pricingTinaResult` and `content` from `tinaResult` (lines 129-141).

- **`components/sections/services.tsx` & `lib/page-sections.tsx`**:
  - `renderBlock` in `lib/page-sections.tsx` passes static `serviceDetails` and `addOnDetails` props to `<Services />` (lines 43-47).
  - `<Services />` overrides these props using `useBooking()` context values (`servicesList`, `addOnsList`) if present (lines 48-51).

- **`app/api/bookings/route.ts`**:
  - Imports `calculateEstimate` from `@/lib/pricing` (line 4) to calculate estimate on form POST submission (lines 61-66).

---

## 2. Logic Chain

1. **Fragmentation of Data Collections**:
   - `content/pricing/pricing.json` and `content/booking/booking.json` are maintained as two distinct Tina collections.
   - However, the booking flow (Step 1 service selector, Step 3 add-ons selector, estimate calculation) and the landing page services section depend on both collections.

2. **Query Redundancy & Overhead**:
   - Every page view on `/` triggers 3 separate Tina GraphQL requests in `app/page.tsx`.
   - `BookingProviderTinaWrapper` invokes `useTina` twice, registering duplicate edit listeners in the TinaCMS visual editor and causing dual re-renders.

3. **Data Discrepancy Risk**:
   - Because `calculateEstimate()` in `lib/pricing.ts` imports static JSON at module top-level, price updates made by content editors in TinaCMS reflect in the frontend drawer UI (via `useTina`), but NOT in the API route `/api/bookings` calculation unless `calculateEstimate` is refactored to consume dynamic dataset parameters.

4. **Consolidation Solution**:
   - Unifying `services` and `addOns` into `content/booking/booking.json` reduces server queries from 3 to 2, eliminates `fetchPricingContent()`, simplifies `<BookingProvider>` to a single `useTina` hook, and ensures single-source-of-truth for both drawer UI and backend price estimation.

---

## 3. Caveats

- **Tina CMS Visual Editor Re-generation**: Modifying `tina/config.ts` to update the `booking` collection schema requires running `npx tinacms build` to regenerate `@/tina/__generated__/client` and schema files.
- **Existing `content/pricing/pricing.json` Migration**: Existing json entries in `content/pricing/pricing.json` must be copied into `content/booking/booking.json` to prevent missing service data during fallback.
- **API Route Dependencies**: `app/api/bookings/route.ts` relies on `calculateEstimate`. When refactoring `calculateEstimate` in `lib/pricing.ts`, it must maintain backwards compatibility or default parameters so the POST route continues functioning seamlessly.

---

## 4. Conclusion

- `fetchPricingContent()` in `lib/pricing.ts` is obsolete once pricing schema (`services` and `addOns`) is merged into `content/booking/booking.json`.
- `app/page.tsx` can be simplified from 3 queries down to 2 (`fetchPageData` and `fetchBookingContent`).
- `<BookingProvider>` can be simplified from dual `useTina` calls down to a single `useTina` hook call.
- Static prop passing in `lib/page-sections.tsx` for `services` can be removed.
- Full refactor design and exact proposed code diffs are documented in `.agents/explorer_2/analysis.md`.

---

## 5. Verification Method

1. **Detailed Analysis File**: Read `.agents/explorer_2/analysis.md` to review the architectural analysis and step-by-step patch designs.
2. **TypeScript Compilation Check**:
   `npx tsc --noEmit`
3. **Tina CMS Schema Build Check**:
   `npx tinacms build`
4. **End-to-End Visual & API Verification**:
   - Verify landing page renders Services section correctly with pricing.
   - Open Booking Drawer and verify service options & add-ons populate.
   - Perform test POST request to `/api/bookings` to verify estimate calculation.
