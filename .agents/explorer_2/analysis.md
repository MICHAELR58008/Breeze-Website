# Detailed Codebase Analysis: TinaCMS Pricing & Booking Integration

## Executive Summary

This report provides an in-depth analysis of the data loading architecture, TinaCMS integration, component hierarchy, and data flow for pricing and booking data within the Breeze website application. Specifically, it examines:
1. `lib/pricing.ts`
2. `lib/booking-content.ts`
3. `app/page.tsx`
4. Associated components (`components/booking/booking-drawer.tsx`, `components/sections/services.tsx`, `lib/page-sections.tsx`) and API routes (`app/api/bookings/route.ts`).

Our analysis reveals that pricing (`content/pricing/pricing.json`) and booking drawer content (`content/booking/booking.json`) are currently maintained as two separate TinaCMS collections and fetched via independent dynamic Tina GraphQL queries. This results in **3 parallel queries on page load**, **double `useTina` visual editor hook calls in client components**, and **static/dynamic data synchronization discrepancies** in pricing estimate calculations.

We present a comprehensive API refactor design that unifies `services` and `addOns` into the `booking` TinaCMS collection query, eliminates obsolete data fetching functions, simplifies component context, and streamlines server component data loading.

---

## 1. Requirement Analysis (R3): How Data is Fetched via TinaCMS

### 1.1 `lib/pricing.ts` Data Fetching Mechanism

In `lib/pricing.ts`:
- **Dynamic Tina Query (`fetchPricingContent`)**:
  ```ts
  export async function fetchPricingContent() {
    try {
      const { client } = await import("@/tina/__generated__/client")
      const res = await (client.queries as any).pricing({ relativePath: "pricing.json" })
      return {
        tina: {
          query: res.query,
          variables: { relativePath: "pricing.json" },
          data: res.data,
        },
        content: res.data.pricing as PricingData,
      }
    } catch {
      return {
        tina: null,
        content: sitePricing as PricingData,
      }
    }
  }
  ```
  - `fetchPricingContent()` performs a dynamic import of `@/tina/__generated__/client` and executes `client.queries.pricing({ relativePath: "pricing.json" })`.
  - If Tina fails (e.g., local environment without Tina credentials), it falls back to bundled JSON (`sitePricing` imported synchronously from `@/content/pricing/pricing.json`).

- **Static Bundled Exports**:
  `lib/pricing.ts` imports `sitePricing` at top of file and exports static constants:
  - `validServiceTypes` (`data.services.map((s) => s.id)`)
  - `validAddOnIds` (`data.addOns.map((a) => a.id)`)
  - `servicesList` (`data.services`)
  - `addOnsList` (`data.addOns`)
  - `serviceDetails` (lookup dictionary by service `id`)
  - `addOnDetails` (lookup dictionary by add-on `id`)
  - `findService(id)`
  - `calculateEstimate(...)`

### 1.2 `lib/booking-content.ts` Data Fetching Mechanism

In `lib/booking-content.ts`:
- **Dynamic Tina Query (`fetchBookingContent`)**:
  ```ts
  export async function fetchBookingContent(): Promise<BookingContentResult> {
    try {
      const { client } = await import("@/tina/__generated__/client")
      const res = await (client.queries as any).booking({ relativePath: "booking.json" })
      const data = (res.data as any)?.booking
      if (!data) throw new Error("No booking data from Tina API")
      return {
        tina: {
          query: res.query,
          variables: { relativePath: "booking.json" },
          data: res.data,
        },
        content: normalizeBookingData(data),
      }
    } catch {
      return {
        tina: null,
        content: bookingContent,
      }
    }
  }
  ```
  - Executes `client.queries.booking({ relativePath: "booking.json" })`.
  - Normalizes raw data via `normalizeBookingData(data)`, providing deep fallbacks for missing properties (`theme`, `steps`, `header`, `stepNames`, `stepLabels`, `timeWindows`, `reviewLabels`, `navigation`, `success`, `estimate`).

### 1.3 `app/page.tsx` Data Fetching and Component Tree Flow

In `app/page.tsx` (Next.js Server Component):
```tsx
export default async function Home() {
  const { tina, sections } = await fetchPageData()
  const bookingResult = await fetchBookingContent()
  const pricingResult = await fetchPricingContent()

  return (
    <BookingProvider
      content={bookingResult.content}
      tina={bookingResult.tina}
      pricingContent={pricingResult.content}
      pricingTina={pricingResult.tina}
    >
      <main className="min-h-screen overflow-x-hidden">
        {tina ? (
          <HomePageClient tina={tina} />
        ) : (
          <BreezeSite sections={sections} />
        )}
      </main>
    </BookingProvider>
  )
}
```

#### Observations on `app/page.tsx`:
1. Executes **3 separate asynchronous queries**: `fetchPageData()`, `fetchBookingContent()`, and `fetchPricingContent()`.
2. Wraps the entire application layout in `<BookingProvider>`, passing four separate props (`content`, `tina`, `pricingContent`, `pricingTina`).
3. Renders `<HomePageClient>` if `tina` (page query result) is available, or `<BreezeSite>` as fallback.

---

## 2. Downstream Data Consumption in Components

### 2.1 `<BookingProvider>` (`components/booking/booking-drawer.tsx`)
`BookingProvider` branches based on whether `tina` is present:
- If `tina?.query` exists, renders `BookingProviderTinaWrapper`.
- Otherwise, renders `BookingProviderStaticWrapper`.

In `BookingProviderTinaWrapper`:
```tsx
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
```
- Calls `useTina` **twice** simultaneously (once for pricing, once for booking).
- Derives `servicesList` and `addOnsList` using `useMemo` from `pricingTinaResult.data?.pricing`.
- Derives `content` (BookingContent) using `useMemo` from `tinaResult.data?.booking`.
- Exposes `BookingContext` values: `{ openBooking, content, servicesList, addOnsList, rawPricing }`.

### 2.2 `<Services />` Component (`components/sections/services.tsx`)
- Consumes `useBooking()` from `BookingContext`:
  ```tsx
  const { openBooking, servicesList, addOnsList, rawPricing } = useBooking()
  ```
- Priority order for rendering services:
  `const services = servicesList && servicesList.length > 0 ? servicesList : props.services`
- Priority order for rendering add-ons:
  `const addOns = addOnsList && addOnsList.length > 0 ? addOnsList.map(...) : props.addOnDetails`
- Renders the service cards, features list, tiered bed/bath pricing options, and add-on price badges.
- Clicking "Quote this service" triggers `openBooking(item.id)`, pre-selecting the service in the booking drawer.

### 2.3 `lib/page-sections.tsx` (`renderBlock`)
- When rendering the `services` block:
  ```tsx
  <Services
    key={`services-${index}`}
    {...(block as ServicesProps)}
    services={Object.values(serviceDetails)}
    addOnDetails={Object.entries(addOnDetails).map(([, v]) => ({
      name: v.name,
      cents: v.price,
    }))}
  />
  ```
  - Pass static imported `serviceDetails` and `addOnDetails` as props to `Services`.
  - **Issue**: `<Services />` immediately ignores these props if `useBooking()` context has dynamic `servicesList`/`addOnsList`, rendering these static props completely redundant.

### 2.4 Booking Drawer Form Steps (`BookingDrawerCore`)
- **Step 1 (Services Selector)**: Maps `servicesList` to display service selection buttons.
- **Step 3 (Add-ons Selector)**: Maps `addOnsList` to display add-on checkboxes with formatted prices.
- **Estimate Calculation**: Calculates total estimate dynamically in `useMemo` based on selected service, bedroom/bathroom count, and selected add-ons.

### 2.5 API Route (`app/api/bookings/route.ts`)
- On form POST submission, imports `calculateEstimate` from `@/lib/pricing`.
- Executes `calculateEstimate(...)` to calculate `estimateCents` stored in Drizzle ORM database (`bookingRequests`).

---

## 3. Identified Obsolete Functions, Duplications & Anti-Patterns

| Issue # | Component / File | Issue Description | Impact |
|---|---|---|---|
| **1** | `app/page.tsx` | Executes 3 parallel queries (`fetchPageData`, `fetchBookingContent`, `fetchPricingContent`) for page render. | Increased TTFB, unnecessary network overhead, fragmented query management. |
| **2** | `components/booking/booking-drawer.tsx` | Calls `useTina` twice in `BookingProviderTinaWrapper`. | Redundant React state listeners; causes dual re-renders when editing in Tina CMS visual editor. |
| **3** | `lib/pricing.ts` | `calculateEstimate()` relies on static file-level `sitePricing` import (`@/content/pricing/pricing.json`). | If a site editor modifies prices in TinaCMS, backend API route (`app/api/bookings/route.ts`) continues using hardcoded static pricing JSON instead of CMS data. |
| **4** | `lib/pricing.ts` | `fetchPricingContent()` is a standalone loader duplicate of `fetchBookingContent()`. | Creates separate Tina collection `pricing` when pricing is exclusively consumed by the booking drawer & services section. |
| **5** | `lib/page-sections.tsx` | Line 43-47 passes static `serviceDetails` & `addOnDetails` props into `<Services />`. | Dead code / unused prop values (overridden by `useBooking()` context). |
| **6** | `tina/config.ts` | Maintains separate `pricing` and `booking` collections. | Editors must navigate two separate collections in Tina CMS admin UI to manage pricing vs booking sheet options. |

---

## 4. Architectural Refactor Design: Unified Booking Content Query

### 4.1 Objectives
1. Consolidate `services` and `addOns` into `content/booking/booking.json` and the TinaCMS `booking` collection schema.
2. Remove `fetchPricingContent()` from `lib/pricing.ts`.
3. Simplify `app/page.tsx` to 2 data fetching calls (`fetchPageData()` and `fetchBookingContent()`).
4. Update `BookingProvider` to use a single `useTina` hook.
5. Make `calculateEstimate` accept dynamic `services` and `addOns` arrays.

### 4.2 System Architecture Before & After

```
BEFORE:
app/page.tsx
 ├── fetchPageData()       --> tina/config.ts ("page")    --> content/page/page.json
 ├── fetchBookingContent() --> tina/config.ts ("booking") --> content/booking/booking.json
 └── fetchPricingContent() --> tina/config.ts ("pricing") --> content/pricing/pricing.json

AFTER (UNIFIED):
app/page.tsx
 ├── fetchPageData()       --> tina/config.ts ("page")    --> content/page/page.json
 └── fetchBookingContent() --> tina/config.ts ("booking") --> content/booking/booking.json
                                                               (contains: theme, header, steps, services, addOns)
```

---

## 5. Detailed Step-by-Step Refactor Implementation Plan

### Step 1: Update TinaCMS Schema (`tina/config.ts`)
Add `services` and `addOns` field definitions to the `booking` collection in `tina/config.ts`. Deprecate/remove `pricing` collection.

```ts
// tina/config.ts (inside booking collection fields)
{
  name: "booking",
  label: "Booking Sheet",
  path: "content/booking",
  format: "json",
  fields: [
    // ... existing fields (previewOpen, theme, header, stepNames, stepLabels, timeWindows, reviewLabels, navigation, success, estimate, steps)
    {
      type: "object",
      name: "services",
      label: "Services & Pricing",
      list: true,
      ui: { itemProps: (item) => ({ label: item?.name || "New Service" }) },
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
      label: "Add-on Services",
      list: true,
      fields: [
        { type: "string", name: "id" },
        { type: "string", name: "name" },
        { type: "number", name: "cents" },
      ],
    },
  ]
}
```

### Step 2: Consolidate JSON Data (`content/booking/booking.json`)
Merge the `services` and `addOns` arrays from `content/pricing/pricing.json` into `content/booking/booking.json`.

```json
{
  "previewOpen": true,
  "header": { ... },
  "stepNames": [ ... ],
  "services": [
    {
      "id": "deep",
      "name": "Deep Cleaning",
      "description": "A detailed reset for your entire home.",
      "subtitle": "The complete reset",
      "features": [
        "Full kitchen & bathroom sanitization",
        "Baseboards, light fixtures, ceiling fans",
        "Inside cabinets & appliances",
        "Window sills, door frames, blinds"
      ],
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
      "features": [
        "All living areas vacuumed & mopped",
        "Kitchen surfaces cleaned & sanitized",
        "Bathrooms scrubbed & disinfected",
        "General dusting & tidying"
      ],
      "prices": [
        { "key": "1-1", "bedrooms": "1", "bathrooms": "1", "cents": 13500 },
        { "key": "2-2", "bedrooms": "2", "bathrooms": "2", "cents": 15000 },
        { "key": "3-3", "bedrooms": "3", "bathrooms": "3", "cents": 18000 }
      ]
    }
  ],
  "addOns": [
    { "id": "garage", "name": "Garage clean", "cents": 4500 },
    { "id": "oven", "name": "Oven clean", "cents": 3000 },
    { "id": "fridge", "name": "Fridge clean", "cents": 3000 }
  ]
}
```

### Step 3: Update `lib/booking-content.ts`
Expand `BookingContent` interface and `normalizeBookingData` to handle `services` and `addOns`.

```ts
import type { ServiceItemData, AddOnData } from "@/lib/pricing"

export interface BookingContent {
  theme?: ThemeConfig
  steps?: FormStepBlock[]
  header: { badge: string; title: string; description: string }
  services: ServiceItemData[]
  addOns: AddOnData[]
  // ... other existing fields
}

export function normalizeBookingData(raw: any): BookingContent {
  return {
    // ... existing normalizations
    services: raw.services?.length ? raw.services : (defaultData as any).services || [],
    addOns: raw.addOns?.length ? raw.addOns : (defaultData as any).addOns || [],
  }
}
```

### Step 4: Refactor `lib/pricing.ts`
1. Remove `fetchPricingContent()`.
2. Update `calculateEstimate` so it accepts optional `services` and `addOns` parameters, defaulting to `bookingContent.services` and `bookingContent.addOns`.

```ts
import defaultBookingData from "@/content/booking/booking.json"

export function calculateEstimate(
  serviceId: string,
  bedrooms: number,
  bathrooms: number,
  selectedAddOns: string[],
  servicesList: ServiceItemData[] = (defaultBookingData as any).services || [],
  addOnsList: AddOnData[] = (defaultBookingData as any).addOns || []
): number | null {
  const svc = servicesList.find((s) => s.id === serviceId)
  if (!svc) return null
  const key = `${bedrooms}-${bathrooms}`
  const priceEntry = svc.prices?.find((p: PriceEntry) => p.key === key)
  if (!priceEntry) return null
  const base = priceEntry.cents
  const addOnTotal = selectedAddOns.reduce((sum, id) => {
    const addon = addOnsList.find((a) => a.id === id)
    return sum + (addon?.cents ?? 0)
  }, 0)
  return base + addOnTotal
}
```

### Step 5: Simplify `app/page.tsx`
Remove `fetchPricingContent()` and pass simplified props to `BookingProvider`.

```tsx
import { BookingProvider } from "@/components/booking/booking-drawer"
import { BreezeSite } from "@/components/breeze-site"
import { HomePageClient } from "./page-client"
import { fetchPageData } from "@/lib/queries"
import { fetchBookingContent } from "@/lib/booking-content"

export default async function Home() {
  const { tina, sections } = await fetchPageData()
  const bookingResult = await fetchBookingContent()

  return (
    <BookingProvider
      content={bookingResult.content}
      tina={bookingResult.tina}
    >
      <main className="min-h-screen overflow-x-hidden">
        {tina ? (
          <HomePageClient tina={tina} />
        ) : (
          <BreezeSite sections={sections} />
        )}
      </main>
    </BookingProvider>
  )
}
```

### Step 6: Simplify `components/booking/booking-drawer.tsx`
Streamline `BookingProvider` to a single `useTina` call and pass `services` / `addOns` directly from unified `content`.

```tsx
export function BookingProvider({
  content: propContent,
  tina,
  children,
}: {
  content: BookingContent
  tina?: { query: string; variables: any; data: any } | null
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
    <BookingDrawerCore content={propContent} rawBooking={null} previewOpen={false}>
      {children}
    </BookingDrawerCore>
  )
}

function BookingProviderTinaWrapper({
  content: propContent,
  tina,
  children,
}: {
  content: BookingContent
  tina: { query: string; variables: any; data: any }
  children: ReactNode
}) {
  const tinaResult = useTina({
    query: tina.query,
    variables: tina.variables,
    data: tina.data,
  })

  const rawBooking = tinaResult.data?.booking
  const content = useMemo(() => {
    return rawBooking ? normalizeBookingData(rawBooking) : propContent
  }, [rawBooking, propContent])

  const previewOpen = Boolean(rawBooking?.previewOpen)

  return (
    <BookingDrawerCore
      content={content}
      rawBooking={rawBooking}
      previewOpen={previewOpen}
    >
      {children}
    </BookingDrawerCore>
  )
}
```

### Step 7: Clean up `lib/page-sections.tsx`
Remove passing obsolete static props in `renderBlock`:

```tsx
case "services":
  return <Services key={`services-${index}`} {...(block as ServicesProps)} />
```

---

## 6. Summary of Benefits & Verification Plan

### Benefits:
1. **Performance**: Reduces server-side Tina GraphQL query calls per page load from 3 to 2.
2. **CMS Visual Editor Stability**: Eliminates double `useTina` hook calls, avoiding redundant editor re-renders.
3. **Data Integrity**: Dynamic pricing updates in TinaCMS editor immediately reflect in both client drawer/tables and server estimate calculations.
4. **Code Cleanliness**: Removes obsolete loader `fetchPricingContent()` and redundant prop passings in section renderer.

### Verification Method:
1. **Type Checking & Build**: Run `npm run build` or `npx tsc --noEmit` to verify zero TypeScript errors.
2. **Tina CMS Schema Generation**: Run `npx tinacms build` to confirm schema compilation.
3. **Page Data Loading Test**: Load home page (`/`) and verify `<BookingProvider>` receives unified content.
4. **Booking Drawer & Services Verification**:
   - Verify Services section renders all dynamic services and pricing cards.
   - Verify Booking Drawer Step 1 displays service buttons and Step 3 displays add-ons with correct pricing.
5. **API Post Request Test**: Submit a test booking via POST `/api/bookings` and verify `estimateCents` matches the calculated estimate.
