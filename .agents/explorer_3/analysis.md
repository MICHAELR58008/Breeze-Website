# Detailed Analysis: UI Components & `useTina` Hook Consolidation for Booking & Pricing

## Executive Summary
This report analyzes the UI component layer, specifically `components/booking/booking-drawer.tsx` and `components/sections/services.tsx`, to prepare for the consolidation of TinaCMS `pricing` and `booking` collections into a unified `booking` collection labeled "Booking & Pricing".

Currently, `BookingProviderTinaWrapper` in `booking-drawer.tsx` invokes **two separate `useTina()` hooks**—one for booking schema data (`tina`) and one for pricing schema data (`pricingTina`). By migrating `services` and `addOns` fields into the unified `booking` collection query, `BookingProviderTinaWrapper` can be simplified to a **single `useTina()` hook**. This removes redundant hook calls, simplifies state management, enables real-time visual editing of pricing within the booking drawer, and ensures 100% calculation correctness and type safety.

---

## 1. Analysis of Current `useTina()` Usage in `booking-drawer.tsx`

### Current State (Lines 47–156 of `components/booking/booking-drawer.tsx`)
`BookingProvider` uses a conditional branch to render `BookingProviderTinaWrapper` when `tina` data is available, and `BookingProviderStaticWrapper` otherwise:

```tsx
// Current Implementation in components/booking/booking-drawer.tsx:103-141
function BookingProviderTinaWrapper({
  content: propContent,
  tina,
  pricingContent,
  pricingTina,
  children,
}: {
  content: BookingContent
  tina: { query: string; variables: any; data: any }
  pricingContent: PricingData
  pricingTina?: { query: string; variables: any; data: any } | null
  children: ReactNode
}) {
  const pricingTinaResult = useTina({
    query: pricingTina?.query || "",
    variables: pricingTina?.variables || {},
    data: pricingTina?.data || {},
  })

  const tinaResult = useTina({
    query: tina.query,
    variables: tina.variables,
    data: tina.data,
  })

  const rawBooking = tinaResult.data?.booking
  const content = useMemo(() => {
    return rawBooking ? normalizeBookingData(rawBooking) : propContent
  }, [rawBooking, propContent])

  const rawPricing = pricingTinaResult.data?.pricing
  const servicesList = useMemo(() => {
    return rawPricing?.services || pricingContent.services
  }, [rawPricing, pricingContent])

  const addOnsList = useMemo(() => {
    return rawPricing?.addOns || pricingContent.addOns
  }, [rawPricing, pricingContent])
  ...
```

### Issues Identified with Current Implementation
1. **Duplicate `useTina()` Calls**: Running two `useTina()` calls inside `BookingProviderTinaWrapper` creates separate subscription channels in the TinaCMS editor.
2. **Defensive Hook Fallbacks (`query: pricingTina?.query || ""` )**: Calling `useTina()` with empty query parameters when `pricingTina` is undefined is a non-standard pattern that can trigger warning logs or unexpected hook state behaviors.
3. **Prop Bloat**: `BookingProvider` requires 4 data props (`content`, `tina`, `pricingContent`, `pricingTina`), increasing coupling across `app/page.tsx` and the provider layer.

---

## 2. Usage of `services` and `addOns` Data in Booking Drawer & Pricing Views

### A. Estimate Calculator (`estimate` useMemo, lines 234–248)
```tsx
const estimate = useMemo(() => {
  const svc = servicesList.find((s) => s.id === formData.serviceType)
  if (!svc) return null
  const key = `${formData.bedrooms || 1}-${formData.bathrooms || 1}`
  const priceEntry = svc.prices?.find((p) => p.key === key)
  if (!priceEntry) return null
  const base = priceEntry.cents
  const selectedAddOns = Array.isArray(formData.addOns) ? formData.addOns : []
  const addOnTotal = selectedAddOns.reduce((sum, id) => {
    const addon = addOnsList.find((a) => a.id === id)
    return sum + (addon?.cents ?? 0)
  }, 0)
  return base + addOnTotal
}, [formData.serviceType, formData.bedrooms, formData.bathrooms, formData.addOns, servicesList, addOnsList])
```
- **Service Lookup**: Matches `formData.serviceType` against `servicesList[].id`.
- **Base Price Calculation**: Matches `${bedrooms}-${bathrooms}` key (e.g. `1-1`, `2-2`) against `priceEntry.key` in `svc.prices`.
- **Add-ons Calculation**: Filters `addOnsList` by IDs present in `formData.addOns` array and sums their `cents`.
- **Output**: Returns integer total in cents, which is formatted via `formatPrice(estimate)` (e.g., 22000 cents -> "$220").

### B. UI Step Renderers (`currentStep.fields?.map`)
- **Service Selector (`case "servicesSelector"`, lines 379–403)**:
  - Iterates over `servicesList`.
  - Attaches `data-tina-field={rawPricing ? tinaField(rawPricing?.services?.[index], "name") : undefined}`.
- **Add-ons Selector (`case "addonsSelector"`, lines 405–430)**:
  - Iterates over `addOnsList`.
  - Attaches `data-tina-field={rawPricing ? tinaField(rawPricing?.addOns?.[index], "name") : undefined}`.
- **Estimate Summary (`case "estimateSummary"`, lines 535–560)**:
  - Displays selected service name, room details, schedule info, and `<EstimateCallout>`.

### C. Downstream Section UI (`components/sections/services.tsx`)
`components/sections/services.tsx` consumes `useBooking()`:
```tsx
const { openBooking, servicesList, addOnsList, rawPricing } = useBooking()
```
It renders main landing page service cards and add-on pills with `data-tina-field` markers.
To maintain complete backwards compatibility for `services.tsx`, `BookingContext` must continue providing `rawPricing` (aliased to `rawBooking`) so visual click-to-edit targets function seamlessly.

---

## 3. Plan to Refactor `booking-drawer.tsx` to a Single `useTina()` Hook

### Consolidated Component Structure

#### 1. Updated `BookingProviderTinaWrapper`
```tsx
function BookingProviderTinaWrapper({
  content: propContent,
  tina,
  children,
}: {
  content: BookingContent
  tina: { query: string; variables: any; data: any }
  children: ReactNode
}) {
  const { data } = useTina({
    query: tina.query,
    variables: tina.variables,
    data: tina.data,
  })

  const rawBooking = data?.booking
  const content = useMemo(() => {
    return rawBooking ? normalizeBookingData(rawBooking) : propContent
  }, [rawBooking, propContent])

  const servicesList = useMemo(() => {
    return rawBooking?.services || content.services || []
  }, [rawBooking, content])

  const addOnsList = useMemo(() => {
    return rawBooking?.addOns || content.addOns || []
  }, [rawBooking, content])

  const previewOpen = Boolean(rawBooking?.previewOpen)

  return (
    <BookingDrawerCore
      content={content}
      servicesList={servicesList}
      addOnsList={addOnsList}
      rawBooking={rawBooking}
      previewOpen={previewOpen}
    >
      {children}
    </BookingDrawerCore>
  )
}
```

#### 2. Updated `BookingProvider` Entry Point
```tsx
export function BookingProvider({
  content: propContent,
  tina,
  pricingContent, // optional / deprecated
  pricingTina,    // optional / deprecated
  children,
}: {
  content: BookingContent
  tina?: { query: string; variables: any; data: any } | null
  pricingContent?: PricingData
  pricingTina?: { query: string; variables: any; data: any } | null
  children: ReactNode
}) {
  if (tina && tina.query) {
    return (
      <BookingProviderTinaWrapper content={propContent} tina={tina}>
        {children}
      </BookingProviderTinaWrapper>
    )
  }

  return (
    <BookingProviderStaticWrapper content={propContent}>
      {children}
    </BookingProviderStaticWrapper>
  )
}
```

#### 3. Updated `BookingProviderStaticWrapper`
```tsx
function BookingProviderStaticWrapper({
  content,
  children,
}: {
  content: BookingContent
  children: ReactNode
}) {
  return (
    <BookingDrawerCore
      content={content}
      servicesList={content.services || []}
      addOnsList={content.addOns || []}
      rawBooking={null}
      previewOpen={false}
    >
      {children}
    </BookingDrawerCore>
  )
}
```

#### 4. Updated `BookingContext` & `BookingDrawerCore`
```tsx
const BookingContext = createContext<{
  openBooking: (service?: string) => void
  content: BookingContent
  servicesList: ServiceItemData[]
  addOnsList: AddOnData[]
  rawPricing: any
  rawBooking: any
}>({
  openBooking: () => undefined,
  content: {} as BookingContent,
  servicesList: [],
  addOnsList: [],
  rawPricing: null,
  rawBooking: null,
})
```

Inside `BookingDrawerCore`:
```tsx
<BookingContext.Provider
  value={{
    openBooking,
    content,
    servicesList,
    addOnsList,
    rawPricing: rawBooking, // Alias rawPricing to rawBooking for backward compatibility
    rawBooking,
  }}
>
```

Updating `data-tina-field` markers:
- Service Selector: `data-tina-field={rawBooking ? tinaField(rawBooking?.services?.[index], "name") : undefined}`
- Add-ons Selector: `data-tina-field={rawBooking ? tinaField(rawBooking?.addOns?.[index], "name") : undefined}`

---

## 4. Verification of Type Definitions & Calculation Safety

### Type Safety Assessment
- `ServiceItemData` and `AddOnData` remain unchanged in structure:
  - `ServiceItemData`: `{ _template: string; id: string; name: string; description: string; subtitle: string; features: string[]; prices: PriceEntry[] }`
  - `AddOnData`: `{ id: string; name: string; cents: number }`
  - `PriceEntry`: `{ key: string; bedrooms: string; bathrooms: string; cents: number }`
- `BookingContent` in `lib/booking-content.ts` must include:
  ```ts
  export interface BookingContent {
    theme?: ThemeConfig
    steps?: FormStepBlock[]
    header: { badge: string; title: string; description: string }
    stepNames: string[]
    stepLabels: { ... }
    timeWindows: Array<{ id: string; label: string }>
    reviewLabels: { ... }
    navigation: { ... }
    success: { ... }
    estimate: { ... }
    services: ServiceItemData[]
    addOns: AddOnData[]
  }
  ```
- Because `normalizeBookingData(raw)` preserves `raw.services` and `raw.addOns`, `content.services` and `content.addOns` will match `ServiceItemData[]` and `AddOnData[]` cleanly.

### Calculation Logic Safety
- `calculateEstimate` logic in `booking-drawer.tsx` (`estimate` useMemo) relies entirely on `servicesList` and `addOnsList`.
- When an editor changes a service price or add-on price in TinaCMS visual editor, `useTina` updates `rawBooking`, which updates `servicesList` and `addOnsList` via `useMemo`.
- React automatically recomputes `estimate` and re-renders `<EstimateCallout>`, providing instant live feedback to the CMS editor.
