# Changes Log

## Files Modified

### 1. `lib/pricing.ts`
- **Line 84**: Updated safety check in `calculateEstimate()` to:
  ```ts
  if (!priceEntry || typeof priceEntry.cents !== "number") return null
  ```
- **Rationale**: Prevents potential `NaN` outputs when `priceEntry.cents` is undefined, missing, or not a number before performing addition operations.

### 2. `components/booking/booking-drawer.tsx`
- **Lines 216–224**: Replaced inline estimate calculation logic inside `const estimate = useMemo(...)` with a unified call to `calculateEstimate(...)`:
  ```ts
  const estimate = useMemo(() => {
    return calculateEstimate(
      formData.serviceType,
      formData.bedrooms || 1,
      formData.bathrooms || 1,
      Array.isArray(formData.addOns) ? formData.addOns : [],
      servicesList,
      addOnsList
    )
  }, [formData.serviceType, formData.bedrooms, formData.bathrooms, formData.addOns, servicesList, addOnsList])
  ```
- **Rationale**: Unifies estimate calculation across the application by delegating directly to `calculateEstimate` from `@/lib/pricing` rather than duplicating calculation logic in `booking-drawer.tsx`.

## Verification Commands & Results
1. `npx tsc --noEmit`
   - Result: Exit code 0, zero type errors.
2. `npm run build`
   - Result: Exit code 0, Next.js build compiled successfully in 1848ms, generated static pages cleanly.
