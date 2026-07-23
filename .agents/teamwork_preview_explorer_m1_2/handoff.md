# Handoff Report: R2 Pricing Model Analysis (`lib/pricing.ts` & `lib/booking-content.ts`)

## 1. Observation
- `lib/pricing.ts` (lines 3–29): Defines `PriceEntry` (`key`, `bedrooms`, `bathrooms`, `cents`) and `ServiceItemData` (`prices: PriceEntry[]`).
- `lib/pricing.ts` (lines 70–91): `calculateEstimate()` performs grid matching by constructing key `${bedrooms}-${bathrooms}` and calling `svc.prices?.find((p) => p.key === key)`. Returns `null` if key match fails.
- `lib/booking-content.ts` (lines 1–2, 71, 172–177): Imports `ServiceItemData` and `AddOnData` from `@/lib/pricing` and incorporates them in `BookingContent` interface and `bookingContent` default export.
- `content/booking/booking.json` (lines 15–34, 47–66): Configures `prices` matrix arrays for `deep` and `regular` services, and omits `prices` for `Commercial ` clean.
- `app/api/bookings/route.ts` (lines 104–119): Invokes `calculateEstimate(...)` and assigns `estimateStatus: estimate === null ? "custom_quote" : "estimated"`.
- `components/booking/booking-drawer.tsx` (lines 216–225): Invokes `calculateEstimate(...)` via `useMemo` to display live estimate or custom quote fallback.
- `components/sections/services.tsx` (lines 108–122): Maps over `item.prices` to render bed/bath price matrix rows.

## 2. Logic Chain
1. The user requested investigation of `lib/pricing.ts` and `lib/booking-content.ts` to replace grid-matching lookup (`prices: PriceEntry[]`) with dynamic linear pricing (R2).
2. Inspection of `lib/pricing.ts` confirms `ServiceItemData` relies on `prices: PriceEntry[]` and `calculateEstimate()` checks exact composite key `${bedrooms}-${bathrooms}` against `svc.prices`.
3. Updating `ServiceItemData` in `lib/pricing.ts` to replace `prices` with `basePriceCents?: number`, `pricePerBedroomCents?: number`, and `pricePerBathroomCents?: number` automatically updates `BookingContent.services` in `lib/booking-content.ts` due to module re-use.
4. Redesigning `calculateEstimate()` to check `if (!svc || !svc.basePriceCents || svc.basePriceCents === 0) return null` ensures any service lacking a valid base price returns `null` ("Custom quote required").
5. Combining `basePriceCents + (bedrooms * pricePerBedroomCents) + (bathrooms * pricePerBathroomCents) + addOnsTotal` provides continuous dynamic calculation for any room combination.
6. Downstream callers (`components/booking/booking-drawer.tsx` and `app/api/bookings/route.ts`) already handle `null` returns seamlessly by switching to custom quote status.

## 3. Caveats
- `components/sections/services.tsx` currently loops over `item.prices`. When implementing R2, `services.tsx` must be updated to display base rates instead of iterating over `item.prices`.
- `content/booking/booking.json` and `tina/config.ts` will need content data and CMS schema field updates to provide `basePriceCents`, `pricePerBedroomCents`, and `pricePerBathroomCents`.

## 4. Conclusion
The modifications for R2 in `lib/pricing.ts` and `lib/booking-content.ts` are clear, localized, and fully specified:
1. Update `ServiceItemData` interface in `lib/pricing.ts` to replace `prices` with `basePriceCents?: number`, `pricePerBedroomCents?: number`, `pricePerBathroomCents?: number`.
2. Rewrite `calculateEstimate()` to check `!svc.basePriceCents || svc.basePriceCents === 0` (returning `null`) and calculate dynamic linear pricing plus `addOnsTotal`.
3. Complete implementation details and diff proposals have been written to `c:\Users\SOL\Desktop\Projet for Breeze\wesite\.agents\teamwork_preview_explorer_m1_2\analysis.md`.

## 5. Verification Method
1. Inspect `analysis.md` and `handoff.md` in `c:\Users\SOL\Desktop\Projet for Breeze\wesite\.agents\teamwork_preview_explorer_m1_2\`.
2. Following code edits in implementation milestone:
   - Run type check: `npx tsc --noEmit`
   - Run build check: `npm run build`
   - Verify `calculateEstimate` unit cases (valid base price vs missing/0 base price returning `null`).
