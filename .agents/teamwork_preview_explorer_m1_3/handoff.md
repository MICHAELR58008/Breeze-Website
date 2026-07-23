# Handoff Report — Explorer Investigation of Booking Services & Pricing

## 1. Observation

### Codebase Usages & Function Definitions
- `lib/pricing.ts` (lines 70-91): `calculateEstimate(serviceId, bedrooms, bathrooms, selectedAddOns, customServices?, customAddOns?)` returns `number | null`.
  - Line 83: `const priceEntry = svc.prices?.find((p: PriceEntry) => p.key === key)`
  - Line 84: `if (!priceEntry || typeof priceEntry.cents !== "number") return null`
  - Line 17: `prices: PriceEntry[]` on `ServiceItemData`.
- `components/booking/booking-drawer.tsx` (lines 216-225, 815-830):
  - Line 216-225: Calculates `estimate` via `useMemo` calling `calculateEstimate(...)`.
  - Line 815-830: `<EstimateCallout />` handles `null` explicitly:
    `{estimate === null ? c.customQuote : formatPrice(estimate)}`
  - Lines 411, 559, 740: `<EstimateCallout />` is rendered in Step 2 (Home size), Step 3 (Extras / add-ons), and Step 7 (Review / summary).
- `app/api/bookings/route.ts` (lines 104-119):
  - Calls `const estimate = calculateEstimate(...)`.
  - Inserts `estimateCents: estimate` and `estimateStatus: estimate === null ? "custom_quote" : "estimated"` into database `bookingRequests` table.
- `lib/db/schema.ts` (lines 10-11):
  - `estimateCents: integer("estimate_cents")` (nullable integer).
  - `estimateStatus: text("estimate_status").notNull()`.
- `components/sections/services.tsx` (lines 24, 108-122):
  - Line 24: `prices: PriceEntry[]` on `ServiceItem`.
  - Line 108: `item.prices?.map(...)` renders service price table entries on landing page.
- `content/booking/booking.json` (lines 69-75, 271):
  - Lines 69-75: `"Commercial Clean"` service does not define a `prices` array field.
  - Line 271: `"customQuote": "Custom quote required"`.

### Verification Command Output
- `npx tsc --noEmit` executed in project root completed with 0 type errors.

---

## 2. Logic Chain

1. **Observation**: `calculateEstimate()` in `lib/pricing.ts:83-84` returns `null` if `svc.prices` is undefined, `priceEntry` is missing, or price is not a number.
2. **Observation**: In `content/booking/booking.json:69-75`, `"Commercial Clean"` has no `prices` property.
3. **Logic Step**: Selecting `"Commercial Clean"` or an unpriced bedroom/bathroom combination causes `calculateEstimate()` to return `null`.
4. **Observation**: In `components/booking/booking-drawer.tsx:823`, `<EstimateCallout />` renders `{estimate === null ? c.customQuote : formatPrice(estimate)}`.
5. **Logic Step**: When `estimate` is `null`, the UI displays `c.customQuote` ("Custom quote required") instead of attempting to format `null` as currency.
6. **Observation**: In `components/booking/booking-drawer.tsx` lines 411, 559, and 740, `<EstimateCallout />` is placed in Step 2 (Home), Step 3 (Extras), and Step 7 (Review).
7. **Logic Step**: All interactive steps and estimate summaries in the booking drawer reflect `"Custom quote required"` when `calculateEstimate()` returns `null`.
8. **Observation**: `lib/pricing.ts:83` (`svc.prices?.find(...)`) and `components/sections/services.tsx:108` (`item.prices?.map(...)`) use optional chaining when accessing `prices`.
9. **Logic Step**: Removing or making the `prices` field optional (`prices?: PriceEntry[]`) does not break any logic or trigger runtime errors.

---

## 3. Caveats

- **TinaCMS Editor Schema**: TinaCMS schema (`tina/config.ts:278-292`) defines `prices` as a field array under `services`. If `prices` is completely removed from TinaCMS schema, editor users will no longer see fixed price fields when managing services in Tina Admin.
- **Service Type ID formatting**: In `content/booking/booking.json:69`, the service ID is `"Commercial "` (with a trailing space). Conditional step logic relies on exact matching (`"showIfValue": "Commercial "`).

---

## 4. Conclusion

1. **UI Readiness**: The UI in `components/booking/booking-drawer.tsx` **already handles `null` return values** from `calculateEstimate()` properly and displays `"Custom quote required"`. No UI code edits are required for `null` handling.
2. **Type Safety & `prices` Field Removal**: All usages of `prices` in `lib/pricing.ts` and `components/sections/services.tsx` use optional chaining (`?.`). Updating `prices: PriceEntry[]` to `prices?: PriceEntry[]` in interface definitions eliminates any potential strict type mismatches without breaking references or creating type errors.

---

## 5. Verification Method

1. **TypeScript Type Check**:
   Run `npx tsc --noEmit` from project root `c:\Users\SOL\Desktop\Projet for Breeze\wesite`. Verify 0 errors are produced.
2. **Code Inspection**:
   - Inspect `components/booking/booking-drawer.tsx` line 823 to verify `{estimate === null ? c.customQuote : formatPrice(estimate)}`.
   - Inspect `app/api/bookings/route.ts` line 118-119 to verify `estimateStatus: estimate === null ? "custom_quote" : "estimated"`.
   - Inspect `lib/pricing.ts` line 83 to verify `svc.prices?.find(...)`.
