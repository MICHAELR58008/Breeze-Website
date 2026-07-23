# Handoff Report: Consolidation of Pricing into Booking Collection

## 1. Observation
- **`tina/config.ts`**:
  - Lines 241–302 define collection `pricing` (`path: "content/pricing"`, `label: "Pricing"`) with fields `services` and `addOns`.
  - Lines 304–532 define collection `booking` (`path: "content/booking"`, `label: "Booking Sheet"`) with fields `previewOpen`, `theme`, `steps`, `header`, `stepNames`, `stepLabels`, `timeWindows`, `reviewLabels`, `navigation`, `success`, `estimate`. `booking` does NOT define `services` or `addOns`.
- **`content/pricing/pricing.json`**:
  - Contains top-level keys `"services"` (3 entries) and `"addOns"` (3 entries).
- **`content/booking/booking.json`**:
  - Contains top-level keys `"previewOpen"`, `"header"`, `"stepNames"`, `"stepLabels"`, `"timeWindows"`, `"reviewLabels"`, `"navigation"`, `"success"`, `"estimate"`.
- **`lib/pricing.ts`**:
  - Imports `@/content/pricing/pricing.json` and issues query `(client.queries as any).pricing({ relativePath: "pricing.json" })`.
- **`lib/booking-content.ts`**:
  - Imports `@/content/booking/booking.json` and issues query `(client.queries as any).booking({ relativePath: "booking.json" })`.
- **`app/page.tsx` & `components/booking/booking-drawer.tsx`**:
  - Calls `fetchBookingContent()` and `fetchPricingContent()` separately and manages dual `useTina` hooks for visual editing context.

## 2. Logic Chain
1. `pricing.json` and `booking.json` represent two separate single-file TinaCMS collections.
2. In `tina/config.ts`, `pricing` defines `services` and `addOns` fields, whereas `booking` defines form copy and theme fields.
3. Adding `services` and `addOns` to `booking`'s schema in `tina/config.ts`, changing `booking`'s label to `"Booking & Pricing"`, and copying the JSON content into `content/booking/booking.json` allows full removal of the `pricing` collection and `content/pricing/pricing.json`.
4. Downstream app code (`lib/pricing.ts`, `lib/booking-content.ts`, `app/page.tsx`, `components/booking/booking-drawer.tsx`) can be simplified to query a single collection (`booking`), improving performance and CMS user experience.

## 3. Caveats
- Downstream TypeScript definitions in `lib/pricing.ts` and `lib/booking-content.ts` will need to be updated to import `booking.json` instead of `pricing.json`.
- TinaCMS auto-generated GraphQL client code (`tina/__generated__`) must be regenerated after schema modification (`tina/config.ts`).
- Service id `"Commercial "` in `pricing.json` has trailing whitespace; implementer should decide whether to trim or preserve.

## 4. Conclusion
Consolidation of `pricing` into `booking` is straightforward and fully feasible.
- Modify `tina/config.ts`: rename `booking` collection label to `"Booking & Pricing"`, move `services` and `addOns` field definitions into `booking`, and delete `pricing` collection definition.
- Merge JSON data: copy `"services"` and `"addOns"` arrays from `pricing.json` into `booking.json`, then delete `content/pricing/pricing.json`.
- Refactor application consumption to fetch and use `booking.json` as the unified source of truth.

## 5. Verification Method
- **File inspection**: Check `tina/config.ts` for collection label `"Booking & Pricing"` and presence of `services` / `addOns` fields in `booking` collection; verify absence of `pricing` collection.
- **Content inspection**: Check `content/booking/booking.json` contains `"services"` and `"addOns"` keys; verify `content/pricing/pricing.json` file is deleted.
- **Type check / Build**: Run `npm run build` or `npx tsc --noEmit` to verify no broken imports or missing properties.
