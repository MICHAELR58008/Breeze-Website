# Handoff Report — Algorithmic Pricing Model Review

## 1. Observation
- **File**: `lib/pricing.ts`
  - Lines 72–79: `calculateEstimate` signature:
    ```ts
    export function calculateEstimate(
      serviceId: string,
      bedrooms: number,
      bathrooms: number,
      selectedAddOns: string[],
      customServices?: ServiceItemData[],
      customAddOns?: AddOnData[],
    ): number | null
    ```
  - Line 83–84: Null check for missing service or zero base price:
    ```ts
    if (!svc) return null
    if (!svc.basePriceCents || svc.basePriceCents === 0) return null
    ```
  - Lines 86–95: Pricing engine logic:
    ```ts
    const base = svc.basePriceCents
    const bedCost = (bedrooms || 0) * (svc.pricePerBedroomCents || 0)
    const bathCost = (bathrooms || 0) * (svc.pricePerBathroomCents || 0)
    const addOnsTotal = (selectedAddOns || []).reduce((sum, id) => {
      const addon = activeAddOns.find((a) => a.id === id)
      return sum + (addon?.cents ?? 0)
    }, 0)
    return base + bedCost + bathCost + addOnsTotal
    ```
- **File**: `content/booking/booking.json`
  - Lines 15–17: `deep` service rates: `basePriceCents: 13000`, `pricePerBedroomCents: 2000`, `pricePerBathroomCents: 3000`.
  - Lines 30–32: `regular` service rates: `basePriceCents: 11000`, `pricePerBedroomCents: 1000`, `pricePerBathroomCents: 1500`.
  - Lines 35–43: `Commercial ` service rates: `basePriceCents: 0`, `pricePerBedroomCents: 0`, `pricePerBathroomCents: 0`.
- **Commands & Output**:
  - `npx tsc --noEmit` -> Executed successfully with zero errors.
  - `npm run build` -> Executed successfully:
    ```
    ✓ Compiled successfully in 1692ms
    ✓ Generating static pages using 5 workers (4/4) in 422ms
    Finalizing page optimization ...
    ```
  - `npx tsx lib/pricing.test.ts` -> Executed successfully:
    ```
    Running pricing calculation tests...
    All pricing calculation tests passed successfully!
    ```

## 2. Logic Chain
1. From Observation 1, `calculateEstimate` has explicit return type `number | null` and checks `if (!svc.basePriceCents || svc.basePriceCents === 0) return null`.
2. From Observation 2, `Commercial ` service has `basePriceCents: 0`. Therefore, calling `calculateEstimate("Commercial ", ...)` returns `null`.
3. From Observation 1 & 2, for `deep` service (base 13000, bed 2000, bath 3000):
   - 1 Bed / 1 Bath = 13000 + 1*2000 + 1*3000 = 18000 cents ($180).
   - 2 Bed / 2 Bath = 13000 + 2*2000 + 2*3000 = 23000 cents ($230).
4. From Observation 1 & 2, for `regular` service (base 11000, bed 1000, bath 1500):
   - 1 Bed / 1 Bath = 11000 + 1*1000 + 1*1500 = 13500 cents ($135).
   - 2 Bed / 2 Bath = 11000 + 2*1000 + 2*1500 = 16000 cents ($160).
5. From Observation 1, undefined or 0 inputs (`bedrooms || 0`, `selectedAddOns || []`, `addon?.cents ?? 0`) fallback safely without throwing runtime errors or yielding `NaN`.
6. From Observation 3, static type checking and Next.js production compilation pass completely.

## 3. Caveats
- Passing negative numbers directly into `calculateEstimate("deep", -1, -1, [])` would result in negative deductions (`-1 || 0` is `-1` in JS). The UI controls prevent this via `min: 1` limits and `onBlur` clamping.

## 4. Conclusion
The implementation of the Algorithmic Pricing Model is approved (VERDICT: APPROVE). It satisfies all specification requirements, correctly handles edge cases, and passes all build and test validations.

## 5. Verification Method
To independently verify this review:
1. Inspect `lib/pricing.ts` and `content/booking/booking.json`.
2. Run `npx tsc --noEmit` in project root (`c:\Users\SOL\Desktop\Projet for Breeze\wesite`).
3. Run `npm run build` in project root.
4. Run `npx tsx lib/pricing.test.ts` in project root.
