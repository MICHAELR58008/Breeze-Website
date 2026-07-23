# Handoff Report — Empirical Challenge of `calculateEstimate()`

## 1. Observation

- **Source Code Inspected**:
  - Path: `c:\Users\SOL\Desktop\Projet for Breeze\wesite\lib\pricing.ts` (lines 72–96):
    ```ts
    export function calculateEstimate(
      serviceId: string,
      bedrooms: number,
      bathrooms: number,
      selectedAddOns: string[],
      customServices?: ServiceItemData[],
      customAddOns?: AddOnData[],
    ): number | null {
      const activeServices = customServices || data.services || []
      const activeAddOns = customAddOns || data.addOns || []
      const svc = activeServices.find((s) => s.id === serviceId)
      if (!svc) return null
      if (!svc.basePriceCents || svc.basePriceCents === 0) return null

      const base = svc.basePriceCents
      const bedCost = (bedrooms || 0) * (svc.pricePerBedroomCents || 0)
      const bathCost = (bathrooms || 0) * (svc.pricePerBathroomCents || 0)

      const addOnsTotal = (selectedAddOns || []).reduce((sum, id) => {
        const addon = activeAddOns.find((a) => a.id === id)
        return sum + (addon?.cents ?? 0)
      }, 0)

      return base + bedCost + bathCost + addOnsTotal
    }
    ```
  - Config Data: `c:\Users\SOL\Desktop\Projet for Breeze\wesite\content\booking\booking.json`:
    - Service `deep`: `basePriceCents: 13000`, `pricePerBedroomCents: 2000`, `pricePerBathroomCents: 3000`
    - Service `regular`: `basePriceCents: 11000`, `pricePerBedroomCents: 1000`, `pricePerBathroomCents: 1500`
    - Service `Commercial `: `basePriceCents: 0`, `pricePerBedroomCents: 0`, `pricePerBathroomCents: 0`
    - Add-ons: `garage` (4,500¢), `oven` (3,000¢), `fridge` (3,000¢)

- **Test Execution & Output**:
  - Standalone script `temp_empirical_pricing_test.ts` was written and executed via `npx tsx temp_empirical_pricing_test.ts`.
  - Result output:
    ```
    === EMPIRICAL PRICING ENGINE VERIFICATION ===
    [PASS] DEEP-1: deep service with 1 bed / 1 bath, without add-ons => got 18000
    [PASS] DEEP-2: deep service with 1 bed / 1 bath, with garage add-on => got 22500
    [PASS] DEEP-3: deep service with 2 bed / 2 bath, without add-ons => got 23000
    [PASS] DEEP-4: deep service with 2 bed / 2 bath, with oven and fridge add-ons => got 29000
    [PASS] DEEP-5: deep service with 3 bed / 3 bath, without add-ons => got 28000
    [PASS] DEEP-6: deep service with 3 bed / 3 bath, with all add-ons (garage, oven, fridge) => got 38500
    [PASS] DEEP-7: deep service with 4 bed / 2 bath, without add-ons => got 27000
    [PASS] DEEP-8: deep service with 4 bed / 2 bath, with garage add-on => got 31500
    [PASS] REG-1: regular service with 1 bed / 1 bath, without add-ons => got 13500
    [PASS] REG-2: regular service with 1 bed / 1 bath, with oven add-on => got 16500
    [PASS] REG-3: regular service with 2 bed / 2 bath, without add-ons => got 16000
    [PASS] REG-4: regular service with 2 bed / 2 bath, with garage and fridge add-ons => got 23500
    [PASS] REG-5: regular service with 3 bed / 3 bath, without add-ons => got 18500
    [PASS] REG-6: regular service with 3 bed / 3 bath, with garage, oven, and fridge add-ons => got 29000
    [PASS] COMM-1: Commercial service (basePriceCents = 0) with 1 bed / 1 bath => got null
    [PASS] COMM-2: Commercial service (basePriceCents = 0) with 2 bed / 2 bath and add-ons => got null
    [PASS] UNK-1: Unknown service ID 'nonexistent_service' => got null
    [PASS] UNK-2: Empty string service ID '' => got null
    [PASS] ZERO-BASE-1: Custom service with basePriceCents = 0 => got null
    [PASS] MISSING-BASE-1: Custom service with undefined basePriceCents => got null
    [PASS] EDGE-1: Selected add-on ID that does not exist ('unknown_addon') => got 18000
    [PASS] EDGE-2: 0 bedrooms and 0 bathrooms => got 13000
    SUMMARY: 22 PASSED, 0 FAILED out of 22 tests.
    ```
  - Existing unit test `lib/pricing.test.ts` was executed via `npx tsx lib/pricing.test.ts`:
    ```
    Running pricing calculation tests...
    All pricing calculation tests passed successfully!
    ```
  - TypeScript compilation check: `npx tsc --noEmit` exited cleanly with exit code 0.
  - Production build check: `npm run build` completed successfully with exit code 0.

## 2. Logic Chain

1. **Service Lookup**:
   - `calculateEstimate` attempts to locate the service by `id` in `activeServices`.
   - If the service ID is unknown or empty string (`nonexistent_service`, `""`), `svc` resolves to `undefined`. Line 83 evaluates `if (!svc) return null`, correctly returning `null`.

2. **Base Price Check**:
   - For `Commercial ` service, `basePriceCents` is explicitly set to `0` in `booking.json`.
   - Line 84 evaluates `if (!svc.basePriceCents || svc.basePriceCents === 0) return null`, correctly returning `null` for `Commercial `, missing, or zero base price services.

3. **Mathematical Correctness**:
   - For `deep` (13000¢ base, 2000¢/bed, 3000¢/bath):
     - 1 bed / 1 bath = $13000 + 2000 + 3000 = 18000¢$
     - 2 bed / 2 bath = $13000 + 4000 + 6000 = 23000¢$
     - 3 bed / 3 bath = $13000 + 6000 + 9000 = 28000¢$
     - 4 bed / 2 bath = $13000 + 8000 + 6000 = 27000¢$
   - For `regular` (11000¢ base, 1000¢/bed, 1500¢/bath):
     - 1 bed / 1 bath = $11000 + 1000 + 1500 = 13500¢$
     - 2 bed / 2 bath = $11000 + 2000 + 3000 = 16000¢$
     - 3 bed / 3 bath = $11000 + 3000 + 4500 = 18500¢$
   - Add-on summation accumulates cents for matching add-on IDs (`garage` = 4500¢, `oven` = 3000¢, `fridge` = 3000¢) and adds `0` for unrecognized add-on IDs.
   - All empirical test run results matched mathematical expected outputs exactly.

4. **Clean Codebase**:
   - Temporary file `temp_empirical_pricing_test.ts` was deleted post-verification.
   - `npx tsc --noEmit` and `npm run build` confirmed type safety and build integrity.

## 3. Caveats

No caveats. All required test combinations, edge cases, and build validations were executed empirically.

## 4. Conclusion

The pricing engine implementation in `lib/pricing.ts` is fully verified, mathematically accurate, and handles invalid / unconfigured / zero-base services cleanly. The project passes all build and type-checking steps.

## 5. Verification Method

To re-verify the pricing calculation:
1. Run existing test suite: `npx tsx lib/pricing.test.ts`
2. Run TypeScript type checker: `npx tsc --noEmit`
3. Run Next.js production build: `npm run build`
