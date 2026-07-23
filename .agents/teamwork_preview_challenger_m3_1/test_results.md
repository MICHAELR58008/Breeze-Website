# Pricing Engine Empirical Test Results Report

**Target File**: `lib/pricing.ts` (`calculateEstimate`)
**Date**: 2026-07-22
**Status**: PASSED (22/22 Empirical Test Scenarios Passed)
**Type Check**: `npx tsc --noEmit` — PASSED (0 errors)
**Build Check**: `npm run build` — PASSED (Next.js production build succeeded)

---

## 1. Executive Summary

Empirical testing was conducted on `calculateEstimate()` implemented in `lib/pricing.ts`. All test cases passed with 100% mathematical accuracy and expected return values across all configured services (`deep`, `regular`, `Commercial `), unconfigured/unknown services, missing/zero `basePriceCents`, and custom add-on selections.

The mathematical formula:
$$\text{expected} = \text{basePriceCents} + (\text{bedrooms} \times \text{pricePerBedroomCents}) + (\text{bathrooms} \times \text{pricePerBathroomCents}) + \text{addOnsTotal}$$
was strictly validated across all service configurations and edge cases.

---

## 2. Comprehensive Test Matrix & Results

### A. Deep Cleaning (`id: "deep"`)
*Base: $130 (13,000¢) | Bed: $20 (2,000¢) | Bath: $30 (3,000¢)*

| Test ID | Inputs (Bed/Bath, Add-ons) | Formula Calculation (Cents) | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| `DEEP-1` | 1 Bed, 1 Bath, None | $13000 + (1 \times 2000) + (1 \times 3000)$ | 18,000¢ ($180) | 18,000¢ | **PASS** |
| `DEEP-2` | 1 Bed, 1 Bath, `["garage"]` | $18000 + 4500$ | 22,500¢ ($225) | 22,500¢ | **PASS** |
| `DEEP-3` | 2 Bed, 2 Bath, None | $13000 + (2 \times 2000) + (2 \times 3000)$ | 23,000¢ ($230) | 23,000¢ | **PASS** |
| `DEEP-4` | 2 Bed, 2 Bath, `["oven", "fridge"]` | $23000 + 3000 + 3000$ | 29,000¢ ($290) | 29,000¢ | **PASS** |
| `DEEP-5` | 3 Bed, 3 Bath, None | $13000 + (3 \times 2000) + (3 \times 3000)$ | 28,000¢ ($280) | 28,000¢ | **PASS** |
| `DEEP-6` | 3 Bed, 3 Bath, `["garage", "oven", "fridge"]` | $28000 + 4500 + 3000 + 3000$ | 38,500¢ ($385) | 38,500¢ | **PASS** |
| `DEEP-7` | 4 Bed, 2 Bath, None | $13000 + (4 \times 2000) + (2 \times 3000)$ | 27,000¢ ($270) | 27,000¢ | **PASS** |
| `DEEP-8` | 4 Bed, 2 Bath, `["garage"]` | $27000 + 4500$ | 31,500¢ ($315) | 31,500¢ | **PASS** |

---

### B. Regular Cleaning (`id: "regular"`)
*Base: $110 (11,000¢) | Bed: $10 (1,000¢) | Bath: $15 (1,500¢)*

| Test ID | Inputs (Bed/Bath, Add-ons) | Formula Calculation (Cents) | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| `REG-1` | 1 Bed, 1 Bath, None | $11000 + (1 \times 1000) + (1 \times 1500)$ | 13,500¢ ($135) | 13,500¢ | **PASS** |
| `REG-2` | 1 Bed, 1 Bath, `["oven"]` | $13500 + 3000$ | 16,500¢ ($165) | 16,500¢ | **PASS** |
| `REG-3` | 2 Bed, 2 Bath, None | $11000 + (2 \times 1000) + (2 \times 1500)$ | 16,000¢ ($160) | 16,000¢ | **PASS** |
| `REG-4` | 2 Bed, 2 Bath, `["garage", "fridge"]` | $16000 + 4500 + 3000$ | 23,500¢ ($235) | 23,500¢ | **PASS** |
| `REG-5` | 3 Bed, 3 Bath, None | $11000 + (3 \times 1000) + (3 \times 1500)$ | 18,500¢ ($185) | 18,500¢ | **PASS** |
| `REG-6` | 3 Bed, 3 Bath, `["garage", "oven", "fridge"]` | $18500 + 4500 + 3000 + 3000$ | 29,000¢ ($290) | 29,000¢ | **PASS** |

---

### C. Commercial Service & Invalid/Unconfigured Services

| Test ID | Scenario | Input Service ID | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| `COMM-1` | Commercial Service (`basePriceCents: 0`) | `"Commercial "` | `null` | `null` | **PASS** |
| `COMM-2` | Commercial Service + Add-ons | `"Commercial "` | `null` | `null` | **PASS** |
| `UNK-1` | Unknown service ID | `"nonexistent_service"` | `null` | `null` | **PASS** |
| `UNK-2` | Empty string service ID | `""` | `null` | `null` | **PASS** |
| `ZERO-BASE-1` | Custom service with basePriceCents = 0 | `"custom_zero"` | `null` | `null` | **PASS** |
| `MISSING-BASE-1`| Custom service with undefined basePriceCents | `"custom_missing"` | `null` | `null` | **PASS** |

---

### D. Stress Testing & Edge Cases

| Test ID | Scenario | Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| `EDGE-1` | Non-existent Add-on ID | `selectedAddOns: ["unknown_addon"]` | Add-on ignored (0¢) | 18,000¢ | **PASS** |
| `EDGE-2` | Zero Beds and Baths | 0 bedrooms, 0 bathrooms | Base price (13,000¢) | 13,000¢ | **PASS** |

---

## 3. Build & Type Checking Verification

1. **TypeScript Verification**:
   - Command: `npx tsc --noEmit`
   - Result: 0 errors detected.

2. **Next.js Production Build**:
   - Command: `npm run build`
   - Result: Compiled successfully in 1,746 ms. Static pages generated without errors.

3. **Cleanup**:
   - Temporary test runner `temp_empirical_pricing_test.ts` was deleted post-execution.

---

## 4. Conclusion & Recommendations

The implementation of `calculateEstimate` in `lib/pricing.ts` is empirically robust, mathematically exact, and handles invalid / custom pricing inputs gracefully. No bugs or pricing regressions were identified.
