# Analysis Report: TinaCMS Pricing & Booking Schema Consolidation

## Executive Summary
This analysis outlines the plan for consolidating the separate `pricing` collection (`content/pricing/pricing.json`) into the `booking` collection (`content/booking/booking.json`). 

Consolidating these schemas into a single collection ("Booking & Pricing") will:
1. Simplify TinaCMS content management by unifying booking form copy, theme settings, services, and add-on pricing in one editor screen.
2. Reduce runtime GraphQL overhead by replacing two separate queries (`booking` and `pricing`) with a single query (`booking`).
3. Streamline live visual preview editing in TinaCMS by eliminating separate `useTina` calls for pricing and booking.

---

## R1: Schema Definition Comparison (`tina/config.ts`)

### Current `pricing` Collection Schema Definition
In `tina/config.ts` (lines 241–302), the `pricing` collection is defined as:
```typescript
{
  name: "pricing",
  label: "Pricing",
  path: "content/pricing",
  format: "json",
  ui: {
    router: () => "/",
    allowedActions: { create: false, delete: false },
  },
  fields: [
    {
      type: "object",
      name: "services",
      label: "Services",
      description: "Add, remove, and reorder services",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.name || "New Service",
        }),
      },
      fields: [
        { type: "string", name: "id", required: true },
        { type: "string", name: "name", required: true },
        { type: "string", name: "description" },
        { type: "string", name: "subtitle" },
        { type: "string", name: "features", list: true },
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
      ],
    },
    {
      type: "object",
      name: "addOns",
      label: "Add-ons",
      list: true,
      fields: [
        { type: "string", name: "id" },
        { type: "string", name: "name" },
        { type: "number", name: "cents" },
      ],
    },
  ],
}
```

### Current `booking` Collection Schema Definition
In `tina/config.ts` (lines 304–532), the `booking` collection is defined with:
- **Collection Name**: `booking`
- **Collection Label**: `"Booking Sheet"`
- **Path**: `content/booking`
- **Format**: `json`
- **Fields**:
  1. `previewOpen` (boolean)
  2. `theme` (object: `fontFamily`, `primaryColor`, `backgroundColor`, `textColor`, `borderRadius`)
  3. `steps` (object list with step field templates including `servicesSelector` & `addonsSelector`)
  4. `header` (object: `badge`, `title`, `description`)
  5. `stepNames` (string list)
  6. `stepLabels` (object)
  7. `timeWindows` (object list)
  8. `reviewLabels` (object)
  9. `navigation` (object)
  10. `success` (object)
  11. `estimate` (object)

### Key Differences & Required Schema Changes
- `booking` currently has no `services` or `addOns` schema fields defined.
- Under the consolidated schema:
  1. Update `booking` collection `label` to `"Booking & Pricing"`.
  2. Move the `services` and `addOns` object list field definitions directly into `booking.fields`.
  3. Delete the `pricing` collection entry from `tina/config.ts`.

---

## R2: Data Structure Comparison (`pricing.json` vs `booking.json`)

### Current `content/pricing/pricing.json` Structure
`content/pricing/pricing.json` contains:
```json
{
  "services": [
    {
      "id": "deep",
      "name": "Deep Cleaning",
      "description": "A detailed reset for your entire home.",
      "subtitle": "The complete reset",
      "features": [ ... ],
      "prices": [
        { "key": "1-1", "bedrooms": "1", "bathrooms": "1", "cents": 18000 },
        { "key": "2-2", "bedrooms": "2", "bathrooms": "2", "cents": 22000 },
        { "key": "3-3", "bedrooms": "3", "bathrooms": "3", "cents": 29000 }
      ]
    },
    {
      "id": "regular",
      "name": "Regular Cleaning",
      "description": "Consistent care that keeps your home feeling fresh.",
      "subtitle": "The reliable rhythm",
      "features": [ ... ],
      "prices": [ ... ]
    },
    {
      "id": "Commercial ",
      "name": "Commercial Clean ",
      "description": "Custom cleaning package",
      "features": [ "1", "2", "3" ],
      "prices": [ { "key": "1", "bedrooms": "1", "bathrooms": "1" } ]
    }
  ],
  "addOns": [
    { "id": "garage", "name": "Garage clean", "cents": 4500 },
    { "id": "oven", "name": "Oven clean", "cents": 3000 },
    { "id": "fridge", "name": "Fridge clean", "cents": 3000 }
  ]
}
```

### Current `content/booking/booking.json` Structure
`content/booking/booking.json` contains top-level properties:
- `previewOpen`: `true`
- `header`: `{ "badge": "", "title": "Let's plan your clean.", "description": "" }`
- `stepNames`: `[ "Service", "Home", "Extras", "Photos", "Schedule", "Contact", "Review" ]`
- `stepLabels`: `{ ... }`
- `timeWindows`: `[ ... ]`
- `reviewLabels`: `{ ... }`
- `navigation`: `{ ... }`
- `success`: `{ ... }`
- `estimate`: `{ ... }`

### Target Consolidated `content/booking/booking.json` Structure
After merging, `content/booking/booking.json` will contain all current `booking.json` keys plus top-level `"services"` and `"addOns"` arrays:
```json
{
  "previewOpen": true,
  "header": { ... },
  "stepNames": [ ... ],
  "stepLabels": { ... },
  "timeWindows": [ ... ],
  "reviewLabels": { ... },
  "navigation": { ... },
  "success": { ... },
  "estimate": { ... },
  "services": [
    ... (services array from pricing.json)
  ],
  "addOns": [
    ... (addOns array from pricing.json)
  ]
}
```

*Note on Data Sanitization*: In `pricing.json`, the third service entry has `"id": "Commercial "` and `"name": "Commercial Clean "` with trailing whitespace. During migration, these can either be preserved or trimmed depending on application requirements.

---

## Concrete Migration Steps

### Step 1: Content Data Migration
1. Read `content/pricing/pricing.json`.
2. Insert top-level `"services"` and `"addOns"` arrays into `content/booking/booking.json`.
3. Delete file `content/pricing/pricing.json`.
4. Remove empty directory `content/pricing`.

### Step 2: Schema Migration in `tina/config.ts`
1. Locate collection `{ name: "booking", label: "Booking Sheet", ... }`.
2. Update `label` to `"Booking & Pricing"`.
3. Append `services` and `addOns` field schemas into `booking.fields`.
4. Remove collection `{ name: "pricing", ... }` completely.

### Step 3: Application Code Adaptation
1. **`lib/pricing.ts`**:
   - Change fallback import from `@/content/pricing/pricing.json` to `@/content/booking/booking.json`.
   - Update `fetchPricingContent()` to read from `booking.json` or delegate to `fetchBookingContent()`.
2. **`lib/booking-content.ts`**:
   - Add `services?: ServiceItemData[]` and `addOns?: AddOnData[]` to `BookingContent` and `normalizeBookingData()`.
3. **`app/page.tsx`**:
   - Remove call to `fetchPricingContent()`. Pass pricing data directly from `bookingResult`.
4. **`components/booking/booking-drawer.tsx`**:
   - Simplify `BookingProviderTinaWrapper` to use a single `useTina` call for `booking`, obtaining both booking labels and `rawBooking?.services` / `rawBooking?.addOns`.

---

## Proposed Code Changes (Diff Sketches)

### Schema Edit in `tina/config.ts`
```typescript
<<<<
      {
        name: "booking",
        label: "Booking Sheet",
        path: "content/booking",
        format: "json",
        ui: {
          router: () => "/",
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: "boolean",
            name: "previewOpen",
            label: "Preview Drawer Open in Editor (turn on to visually edit)",
          },
====
      {
        name: "booking",
        label: "Booking & Pricing",
        path: "content/booking",
        format: "json",
        ui: {
          router: () => "/",
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: "boolean",
            name: "previewOpen",
            label: "Preview Drawer Open in Editor (turn on to visually edit)",
          },
          {
            type: "object",
            name: "services",
            label: "Services",
            description: "Add, remove, and reorder services",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.name || "New Service",
              }),
            },
            fields: [
              { type: "string", name: "id", required: true },
              { type: "string", name: "name", required: true },
              { type: "string", name: "description" },
              { type: "string", name: "subtitle" },
              { type: "string", name: "features", list: true },
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
            ],
          },
          {
            type: "object",
            name: "addOns",
            label: "Add-ons",
            list: true,
            fields: [
              { type: "string", name: "id" },
              { type: "string", name: "name" },
              { type: "number", name: "cents" },
            ],
          },
>>>>
```

---

## Verification Plan
1. Validate JSON syntax of updated `content/booking/booking.json`.
2. Confirm `content/pricing/pricing.json` no longer exists.
3. Validate TypeScript compilation / linting of `tina/config.ts` and downstream code (`npm run build` or `npx tsc --noEmit`).
4. Verify TinaCMS schema generation and GraphQL query compatibility.
