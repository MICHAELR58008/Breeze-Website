# Analysis Report: TinaCMS Booking Pricing Schema (R1) & Content Migration (R3)

**Author**: Explorer Subagent (`teamwork_preview_explorer_m1_1`)  
**Date**: 2026-07-22  
**Target Files**: `tina/config.ts`, `content/booking/booking.json`  

---

## Executive Summary

The current booking pricing system in Breeze uses a fixed lookup matrix (`prices` array containing discrete `{ key, bedrooms, bathrooms, cents }` entries) on each service item. This matrix-based design creates significant usability and functional issues:
1. **Unmatched matrix gaps**: Any bedroom/bathroom combination not explicitly listed in the `prices` array (e.g., 2 bed / 1 bath) returns `null` from `calculateEstimate()`, falling back to custom quotes instead of offering dynamic estimates.
2. **High content management overhead**: Content editors using TinaCMS must manually construct key-value matrix items for every room combination.

To resolve this, requirement **R1** replaces the nested `prices` array in `tina/config.ts` with three scalar numeric fields per service: `basePriceCents`, `pricePerBedroomCents`, and `pricePerBathroomCents`. Requirement **R3** migrates the existing service content in `content/booking/booking.json` to populate these new scalar fields with calibrated baseline pricing.

---

## 1. Analysis of Current TinaCMS Schema Structure (`tina/config.ts`)

In `tina/config.ts` (lines 241–305), the `booking` collection defines `services` as an object list. Each service currently contains:

```typescript
// tina/config.ts (Lines 276-292)
{
  type: "object",
  name: "prices",
  label: "Prices",
  list: true,
  ui: {
    itemProps: (item) => ({
      label: item?.key ? `${item.key.replace("-", " Bed / ")} Bath` : "New Price",
    }),
  },
  fields: [
    { type: "string", name: "key" },
    { type: "string", name: "bedrooms" },
    { type: "string", name: "bathrooms" },
    { type: "number", name: "cents" },
  ],
}
```

### Key Limitations of the Current Schema:
- **Nested List Overhead**: TinaCMS UI renders `prices` as a nested array manager. Content editors must add items one-by-one.
- **Inconsistent Keys & String Types**: `bedrooms` and `bathrooms` are stored as strings inside individual price objects, leading to string key formatting (`"1-1"`, `"2-2"`, `"3-3"`).
- **Rigid Combinations**: Only pre-configured combinations are supported.

---

## 2. Analysis of Current `content/booking/booking.json` Content

In `content/booking/booking.json` (lines 3–76), there are three service entries:

### 1. `deep` (Deep Cleaning)
```json
{
  "id": "deep",
  "name": "Deep Cleaning",
  "prices": [
    { "key": "1-1", "bedrooms": "1", "bathrooms": "1", "cents": 18000 },
    { "key": "2-2", "bedrooms": "2", "bathrooms": "2", "cents": 22000 },
    { "key": "3-3", "bedrooms": "3", "bathrooms": "3", "cents": 29000 }
  ]
}
```
* Pricing breakdown:
  * 1 Bed / 1 Bath = $180.00 (18,000 cents)
  * 2 Bed / 2 Bath = $220.00 (22,000 cents) — delta: +$40.00 (+4,000 cents)
  * 3 Bed / 3 Bath = $290.00 (29,000 cents) — delta: +$70.00 (+7,000 cents)

### 2. `regular` (Regular Cleaning)
```json
{
  "id": "regular",
  "name": "Regular Cleaning",
  "prices": [
    { "key": "1-1", "bedrooms": "1", "bathrooms": "1", "cents": 13500 },
    { "key": "2-2", "bedrooms": "2", "bathrooms": "2", "cents": 15000 },
    { "key": "3-3", "bedrooms": "3", "bathrooms": "3", "cents": 18000 }
  ]
}
```
* Pricing breakdown:
  * 1 Bed / 1 Bath = $135.00 (13,500 cents)
  * 2 Bed / 2 Bath = $150.00 (15,000 cents) — delta: +$15.00 (+1,500 cents)
  * 3 Bed / 3 Bath = $180.00 (18,000 cents) — delta: +$30.00 (+3,000 cents)

### 3. `Commercial ` (Commercial Clean)
```json
{
  "id": "Commercial ",
  "name": "Commercial Clean ",
  "description": "Custom cleaning package",
  "features": ["1"]
}
```
* Note: Trailing space in `"id": "Commercial "` and `"name": "Commercial Clean "`. Has **no** `prices` array in `booking.json`. Commercial clean bypasses the Home size step (`showIfOperator: "not_equals"`, `showIfValue: "Commercial "`) and requires custom quotes.

---

## 3. R1: Exact Schema Changes (`tina/config.ts`)

In `tina/config.ts`, inside `schema.collections[1]` (the `"booking"` collection), locate the `services` field definitions (lines 276–292).

### Action:
Remove the `prices` object field completely and replace it with three top-level number fields on each service object: `basePriceCents`, `pricePerBedroomCents`, and `pricePerBathroomCents`.

### Target Snippet Replacement:

**Remove**:
```typescript
              {
                type: "object",
                name: "prices",
                label: "Prices",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.key ? `${item.key.replace("-", " Bed / ")} Bath` : "New Price",
                  }),
                },
                fields: [
                  { type: "string", name: "key" },
                  { type: "string", name: "bedrooms" },
                  { type: "string", name: "bathrooms" },
                  { type: "number", name: "cents" },
                ],
              },
```

**Insert**:
```typescript
              {
                type: "number",
                name: "basePriceCents",
                label: "Base Price (in Cents)",
                description: "Starting base price in cents (e.g. 13000 = $130.00)",
              },
              {
                type: "number",
                name: "pricePerBedroomCents",
                label: "Price per Bedroom (in Cents)",
                description: "Additional cost per bedroom in cents (e.g. 2000 = $20.00)",
              },
              {
                type: "number",
                name: "pricePerBathroomCents",
                label: "Price per Bathroom (in Cents)",
                description: "Additional cost per bathroom in cents (e.g. 3000 = $30.00)",
              },
```

---

## 4. R3: Exact Data Migration Plan (`content/booking/booking.json`)

To compute the new linear pricing values (`basePriceCents`, `pricePerBedroomCents`, `pricePerBathroomCents`), we use the formula:
$$\text{Price}(\text{beds}, \text{baths}) = \text{basePriceCents} + (\text{beds} \times \text{pricePerBedroomCents}) + (\text{baths} \times \text{pricePerBathroomCents})$$

### Recommended Migrated Values & Rationale:

#### 1. `deep` (Deep Cleaning)
* `basePriceCents`: **13000** ($130.00)
* `pricePerBedroomCents`: **2000** ($20.00)
* `pricePerBathroomCents`: **3000** ($30.00)

*Validation*:
* 1 Bed / 1 Bath: $130 + $20 + $30 = **$180.00** (Exact match to existing $180)
* 2 Bed / 2 Bath: $130 + $40 + $60 = **$230.00** (Very close to existing $220)
* 3 Bed / 3 Bath: $130 + $60 + $90 = **$280.00** (Very close to existing $290)

#### 2. `regular` (Regular Cleaning)
* `basePriceCents`: **11000** ($110.00)
* `pricePerBedroomCents`: **1000** ($10.00)
* `pricePerBathroomCents`: **1500** ($15.00)

*Validation*:
* 1 Bed / 1 Bath: $110 + $10 + $15 = **$135.00** (Exact match to existing $135)
* 2 Bed / 2 Bath: $110 + $20 + $30 = **$160.00** (Very close to existing $150)
* 3 Bed / 3 Bath: $110 + $30 + $45 = **$185.00** (Very close to existing $180)

#### 3. `Commercial ` (Commercial Clean)
* `basePriceCents`: **0**
* `pricePerBedroomCents`: **0**
* `pricePerBathroomCents`: **0**

*Validation*:
* Commercial cleaning uses custom quotes; setting scalar pricing fields to `0` satisfies schema validation while maintaining custom quote behavior.

---

### Migrated `content/booking/booking.json` Services Snippet:

```json
  "services": [
    {
      "id": "deep",
      "name": "Deep Cleaning",
      "description": "Comprehensive top to bottom clean",
      "subtitle": "",
      "features": [
        "Full kitchen & bathroom sanitization",
        "Baseboards, light fixtures, ceiling fans",
        "Inside cabinets & appliances",
        "Window sills, door frames, blinds"
      ],
      "basePriceCents": 13000,
      "pricePerBedroomCents": 2000,
      "pricePerBathroomCents": 3000
    },
    {
      "id": "regular",
      "name": "Regular Cleaning",
      "description": "Basic clean and maintenence",
      "subtitle": "",
      "features": [
        "All living areas vacuumed & mopped",
        "Kitchen surfaces cleaned & sanitized",
        "Bathrooms scrubbed & disinfected",
        "General dusting & tidying"
      ],
      "basePriceCents": 11000,
      "pricePerBedroomCents": 1000,
      "pricePerBathroomCents": 1500
    },
    {
      "id": "Commercial ",
      "name": "Commercial Clean ",
      "description": "Custom cleaning package",
      "features": [
        "1"
      ],
      "basePriceCents": 0,
      "pricePerBedroomCents": 0,
      "pricePerBathroomCents": 0
    }
  ],
```

---

## 5. Downstream Impact Analysis (`lib/pricing.ts`)

Although this investigation task focus is on R1 and R3, the implementer will need to update `lib/pricing.ts` to match the new schema structure:

1. **`ServiceItemData` Type**:
```typescript
export type ServiceItemData = {
  _template?: string
  id: string
  name: string
  description: string
  subtitle?: string
  features?: string[]
  basePriceCents?: number
  pricePerBedroomCents?: number
  pricePerBathroomCents?: number
}
```

2. **`calculateEstimate` Function**:
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
  if (typeof svc.basePriceCents !== "number") return null

  const base = svc.basePriceCents + (bedrooms * (svc.pricePerBedroomCents || 0)) + (bathrooms * (svc.pricePerBathroomCents || 0))
  const addOnTotal = selectedAddOns.reduce((sum, id) => {
    const addon = activeAddOns.find((a) => a.id === id)
    return sum + (addon?.cents ?? 0)
  }, 0)

  return base + addOnTotal
}
```

---

## Summary of Recommendations

1. **Schema Update (R1)**: Replace `prices` array field definition in `tina/config.ts` with 3 number fields (`basePriceCents`, `pricePerBedroomCents`, `pricePerBathroomCents`).
2. **Data Migration (R3)**: Remove `"prices"` arrays from `content/booking/booking.json` and insert the calibrated scalar prices (`deep`: 13000/2000/3000; `regular`: 11000/1000/1500; `Commercial `: 0/0/0).
3. **Tina Client Re-generation**: Run `npx tinacms build` or dev script after schema edit to update `tina/__generated__/types.ts`.
