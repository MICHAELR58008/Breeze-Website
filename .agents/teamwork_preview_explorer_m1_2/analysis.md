# R2 Pricing Model Investigation & Analysis: Dynamic Linear Pricing

## Executive Summary
This document provides a comprehensive analysis of the existing grid-matching pricing model in `lib/pricing.ts` and `lib/booking-content.ts`, and details the exact modifications required for **R2 (Dynamic Linear Pricing)**. 

Under R2, fixed grid-matching lookup arrays (`prices: PriceEntry[]`) are replaced by dynamic calculation attributes on each service:
- `basePriceCents?: number`
- `pricePerBedroomCents?: number`
- `pricePerBathroomCents?: number`

Price calculation formula:
$$\text{Total Estimate} = \text{basePriceCents} + (\text{bedrooms} \times \text{pricePerBedroomCents}) + (\text{bathrooms} \times \text{pricePerBathroomCents}) + \text{addOnsTotal}$$

---

## 1. Current Implementation Analysis (`lib/pricing.ts` & `lib/booking-content.ts`)

### 1.1 Existing Type Definitions & Interfaces

#### `lib/pricing.ts` (Lines 3–30):
```typescript
export type PriceEntry = {
  key: string        // e.g. "1-1", "2-2", "3-3"
  bedrooms: string   // e.g. "1"
  bathrooms: string  // e.g. "2"
  cents: number      // e.g. 18000
}

export type ServiceItemData = {
  _template: string
  id: string
  name: string
  description: string
  subtitle: string
  features: string[]
  prices: PriceEntry[] // Grid matrix model
}

export type AddOnData = {
  id: string
  name: string
  cents: number
}

export type PricingData = {
  services: ServiceItemData[]
  addOns: AddOnData[]
}
```

#### `lib/booking-content.ts` (Lines 53–74):
```typescript
export interface BookingContent {
  theme?: ThemeConfig
  steps?: FormStepBlock[]
  header: { badge: string; title: string; description: string }
  stepNames: string[]
  timeWindows: Array<{ id: string; label: string }>
  reviewLabels: { ... }
  navigation: { ... }
  success: { ... }
  estimate: { label: string; customQuote: string; disclaimer: string }
  services: ServiceItemData[] // Uses ServiceItemData from lib/pricing
  addOns: AddOnData[]        // Uses AddOnData from lib/pricing
}
```

---

### 1.2 Mechanics of `calculateEstimate()` (Current Grid Matching Model)

Currently in `lib/pricing.ts` (Lines 70–91):
```typescript
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
  const key = `${bedrooms}-${bathrooms}`
  const priceEntry = svc.prices?.find((p: PriceEntry) => p.key === key)
  if (!priceEntry || typeof priceEntry.cents !== "number") return null
  const base = priceEntry.cents
  const addOnTotal = selectedAddOns.reduce((sum, id) => {
    const addon = activeAddOns.find((a) => a.id === id)
    return sum + (addon?.cents ?? 0)
  }, 0)
  return base + addOnTotal
}
```

#### Step-by-Step Evaluation of Grid Matching Model:
1. **Service Lookup**: Matches `serviceId` against `activeServices`. Returns `null` if not found.
2. **Key Generation**: Formats `${bedrooms}-${bathrooms}` into a discrete lookup string (e.g., `1-1`, `2-2`).
3. **Matrix Lookup**: Searches `svc.prices` for `priceEntry.key === key`.
4. **Validation**: If `priceEntry` does not exist for that exact key (e.g., `2-1`, `3-1`, or a Commercial service without a `prices` array), or if `cents` is invalid, returns `null`.
5. **Add-on Summation**: Sums `cents` for each matching ID in `selectedAddOns`.
6. **Return**: Returns `base + addOnTotal` or `null`.

#### Key Drawbacks of Current Model:
- **Inflexible Matrix**: Any room combination not explicitly listed in `booking.json` (such as 2 beds, 1 bath) returns `null` ("Custom quote required"), even for standard residential cleans.
- **Maintenance Overhead**: Admin users must configure every discrete bed/bath combination separately in CMS/JSON.

---

## 2. R2 Specifications & Detailed Code Modifications Required

### 2.1 Interface Updates

#### `lib/pricing.ts`:
Replace `prices: PriceEntry[]` in `ServiceItemData` with dynamic rate properties. `PriceEntry` can be removed or deprecated.

```typescript
export type ServiceItemData = {
  _template?: string
  id: string
  name: string
  description?: string
  subtitle?: string
  features?: string[]
  basePriceCents?: number
  pricePerBedroomCents?: number
  pricePerBathroomCents?: number
}
```

#### `lib/booking-content.ts`:
No structural changes needed in `lib/booking-content.ts` interface definitions because `BookingContent.services` references `ServiceItemData[]` imported directly from `@/lib/pricing`.

---

### 2.2 Dynamic Calculation Implementation for `calculateEstimate()`

#### Proposed Implementation in `lib/pricing.ts`:

```typescript
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
  
  // Rule: Lacking or zero basePriceCents returns null ("Custom quote required")
  if (!svc || !svc.basePriceCents || svc.basePriceCents === 0) {
    return null
  }

  const numBedrooms = Math.max(0, bedrooms || 0)
  const numBathrooms = Math.max(0, bathrooms || 0)

  const perBedroomCents = svc.pricePerBedroomCents ?? 0
  const perBathroomCents = svc.pricePerBathroomCents ?? 0

  const addOnsTotal = selectedAddOns.reduce((sum, id) => {
    const addon = activeAddOns.find((a) => a.id === id)
    return sum + (addon?.cents ?? 0)
  }, 0)

  return (
    svc.basePriceCents +
    numBedrooms * perBedroomCents +
    numBathrooms * perBathroomCents +
    addOnsTotal
  )
}
```

---

### 2.3 Critical Business Logic & Behavioral Rules

1. **Handling Missing / Zero `basePriceCents`**:
   - If `!svc.basePriceCents`, `svc.basePriceCents === 0`, or `svc.basePriceCents === undefined`, `calculateEstimate()` **MUST return `null`**.
   - Example: Commercial Cleaning (`id: "Commercial "`) has no base price defined. Returning `null` signals to the system that an estimate cannot be computed automatically.

2. **Integration with UI & API**:
   - **Frontend Drawer (`components/booking/booking-drawer.tsx`)**: When `estimate === null`, the drawer renders `estimate.customQuote` ("Custom quote required") instead of a numerical total price.
   - **Backend API (`app/api/bookings/route.ts`)**: Lines 118–119 inspect the output of `calculateEstimate(...)`:
     ```typescript
     estimateCents: estimate,
     estimateStatus: estimate === null ? "custom_quote" : "estimated"
     ```
     Returning `null` correctly flags the DB record as `custom_quote`.

3. **Add-Ons Interaction**:
   - Add-on costs are added on top of the service calculation.
   - If `basePriceCents` is invalid (`null`/`0`/`undefined`), the return value is immediately `null`—add-ons do not override a custom quote requirement.

4. **Bedroom and Bathroom Multipliers**:
   - `pricePerBedroomCents` and `pricePerBathroomCents` default to `0` if omitted or undefined.
   - Multipliers are applied to the counts passed into `calculateEstimate()`. Clamping with `Math.max(0, ...)` guards against invalid negative numbers.

---

## 3. Associated System-Wide Dependencies & Secondary Changes

While `lib/pricing.ts` and `lib/booking-content.ts` are the primary scope, the following dependent files require alignment when R2 is applied:

1. **Content JSON (`content/booking/booking.json`)**:
   Update `services` array items to remove `prices` arrays and supply linear parameters:
   ```json
   {
     "id": "deep",
     "name": "Deep Cleaning",
     "basePriceCents": 18000,
     "pricePerBedroomCents": 4000,
     "pricePerBathroomCents": 3000
   }
   ```

2. **Tina CMS Schema (`tina/config.ts`)**:
   In `services` fields definition (lines 277–292), replace `prices` list object with `basePriceCents`, `pricePerBedroomCents`, and `pricePerBathroomCents` number fields.

3. **Services Section Component (`components/sections/services.tsx`)**:
   Update rendering logic (lines 108–122) which currently iterates over `item.prices` to display grid prices. For R2, update to render starting/base price or per-room rates.

---

## 4. Verification Plan

1. **Type Checker Validation**:
   Run `npx tsc --noEmit` to confirm no type mismatch exists between `lib/pricing.ts`, `lib/booking-content.ts`, and component consumers.

2. **Unit / Logical Scenario Testing**:
   - Standard Service (`deep` clean, 2 bed, 2 bath, 1 add-on):
     $180.00 + (2 \times 40.00) + (2 \times 30.00) + 45.00 = 18000 + 8000 + 6000 + 4500 = 36500$ ($365.00).
   - Zero/Missing Base Price (`Commercial` clean):
     `basePriceCents: undefined` -> returns `null` ("Custom quote required").
   - Service with No Per-Room Fee (`basePriceCents: 15000`, zero bed/bath rates):
     Returns `15000 + addOnsTotal`.
