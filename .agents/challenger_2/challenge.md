# Adversarial Challenge & Stress Test Report — challenger_2

**Date**: 2026-07-22  
**Target Scope**: `components/booking/booking-drawer.tsx`, `app/api/bookings/route.ts`, `lib/pricing.ts`  
**Test Harness Location**: `.agents/challenger_2/stress-test.ts`  

---

## Challenge Summary

**Overall risk assessment**: **LOW** (No regressions detected; pricing engine, Bed/Bath step filtering, and dynamic API form parsing operate robustly).

---

## Stress Test Results Matrix (35 / 35 Passed)

| Category | Test Scenario | Expected Outcome | Actual Outcome | Status |
|---|---|---|---|---|
| **Pricing Engine** | Deep 1 bed / 1 bath | `18000` cents ($180) | `18000` cents ($180) | **PASS** |
| **Pricing Engine** | Deep 2 bed / 2 bath + oven | `25000` cents ($250) | `25000` cents ($250) | **PASS** |
| **Pricing Engine** | Deep 3 bed / 3 bath + all add-ons | `39500` cents ($395) | `39500` cents ($395) | **PASS** |
| **Pricing Engine** | Regular 1 bed / 1 bath | `13500` cents ($135) | `13500` cents ($135) | **PASS** |
| **Pricing Engine** | Regular 2 bed / 2 bath + fridge | `18000` cents ($180) | `18000` cents ($180) | **PASS** |
| **Pricing Engine** | Regular 3 bed / 3 bath | `18000` cents ($180) | `18000` cents ($180) | **PASS** |
| **Pricing Engine** | Commercial Clean (no grid) | `null` (Custom Quote) | `null` (Custom Quote) | **PASS** |
| **Pricing Engine** | Unmatched Bed/Bath (1 bed / 2 bath) | `null` (Custom Quote) | `null` (Custom Quote) | **PASS** |
| **Pricing Engine** | Out-of-range Bed/Bath (4 bed / 4 bath) | `null` (Custom Quote) | `null` (Custom Quote) | **PASS** |
| **Pricing Engine** | Bed/Bath (0 / 0) | `null` | `null` | **PASS** |
| **Pricing Engine** | Negative bedrooms (-1 / 1) | `null` | `null` | **PASS** |
| **Pricing Engine** | Unknown Service ID | `null` | `null` | **PASS** |
| **Pricing Engine** | Empty Service ID | `null` | `null` | **PASS** |
| **Pricing Engine** | Non-existent Add-on ID | Base price preserved (+0) | Base price preserved (+0) | **PASS** |
| **Pricing Engine** | Duplicate Add-on IDs | Summed (18000 + 3000 + 3000 = 24000) | 24000 cents | **PASS** |
| **Pricing Engine** | Price Formatter `$180` | `"$180"` | `"$180"` | **PASS** |
| **Pricing Engine** | Price Formatter `$135` | `"$135"` | `"$135"` | **PASS** |
| **Pricing Engine** | Price Formatter `$0` | `"$0"` | `"$0"` | **PASS** |
| **Step Conditional** | Deep clean -> Home step included | Includes Home step | Includes Home step | **PASS** |
| **Step Conditional** | Commercial clean -> Home step hidden | Hides Home step | Hides Home step | **PASS** |
| **Step Conditional** | Operators `equals` and `contains` | Matches active steps | Matches active steps | **PASS** |
| **Step Conditional** | Operators negative match | Filters out steps | Filters out steps | **PASS** |
| **API Form Parsing** | Multiline Textarea string | Intact string in `customFields` | Intact string in `customFields` | **PASS** |
| **API Form Parsing** | Select dropdown option string | Direct string in `customFields` | Direct string in `customFields` | **PASS** |
| **API Form Parsing** | JSON Checkbox Array | Native JS string array | Native JS string array | **PASS** |
| **API Form Parsing** | Additional Checkbox Array | Native JS array | Native JS array | **PASS** |
| **API Form Parsing** | JSON Object Payload | Native nested JS object | Native nested JS object | **PASS** |
| **Zod Validation** | Dynamic `customFields` payload | `safeParse` returns `success: true` | `success: true` | **PASS** |
| **Zod Validation** | Payload customFields integrity | Preserved exactly | Preserved exactly | **PASS** |
| **Zod Validation** | Invalid payload fallback handling | `success: true` via `.catch()` | `success: true` | **PASS** |
| **Zod Validation** | Bed/Bath out-of-range fallback | Defaults to `1` | Defaults to `1` | **PASS** |
| **Zod Validation** | AddOns malformed fallback | Defaults to `[]` | Defaults to `[]` | **PASS** |
| **Zod Validation** | Name invalid fallback | Defaults to `"Guest Customer"` | Defaults to `"Guest Customer"` | **PASS** |
| **Zod Validation** | Website honeypot non-empty | Cleared to `""` | Cleared to `""` | **PASS** |
| **Build & Check** | TypeScript check (`npx tsc --noEmit`) | 0 type errors | 0 type errors | **PASS** |
| **Build & Check** | Next.js Build (`npm run build`) | Build succeeds | Build compiled successfully | **PASS** |

---

## Detailed Observations & Findings

### 1. Pricing Engine (`calculateEstimate`)
- Tested exact match keys (`1-1`, `2-2`, `3-3`) across `deep` and `regular` services.
- Confirmed that missing keys (e.g. `1-2`, `4-4`, negative numbers) return `null`.
- Confirmed that services without price grids (e.g. `Commercial `) return `null`, rendering `"Custom Quote"` in the booking drawer and storing `estimateStatus: "custom_quote"` in DB.

### 2. Bed/Bath Step Conditional Logic
- In `components/booking/booking-drawer.tsx`, `steps` memoization correctly applies conditional rules (`showIfField`, `showIfOperator`, `showIfValue`).
- Selecting `"Commercial "` dynamically hides the "Home" (Bed/Bath) step.

### 3. Dynamic Form Value Parsing in API Route (`app/api/bookings/route.ts`)
- All non-core fields are extracted from `FormData` and put into `customFields`.
- Strings starting with `[` or `{` are parsed with `JSON.parse()` (converting stringified JSON arrays into native arrays, and JSON objects into native objects). Textarea strings and single select strings remain untouched.
- `z.record(z.string(), z.unknown())` in Zod schema permits arbitrary dynamic form schema structures without throwing validation errors.
- `.catch()` clauses on core schema fields ensure resilient server-side handling without unhandled 400 crashes for invalid inputs.

---

## Unchallenged Areas

- Database persistence layer (`db.insert(bookingRequests)`): database environment connection requires runtime PostgreSQL DB credentials, tested schema and mock structure logic.
- Vercel Blob storage (`put` / `del`): API route blob upload mock/unit testing requires Vercel Blob token in production environment.
