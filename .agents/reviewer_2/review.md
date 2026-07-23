# Code Review Report — Booking Drawer UI Rendering & API Endpoint

**Reviewer**: Reviewer 2 (`reviewer_2`)  
**Date**: 2026-07-22  
**Target Files**:
- `components/booking/booking-drawer.tsx`
- `app/api/bookings/route.ts`

---

## Review Summary

**Verdict**: **APPROVE**

The implementation of the Booking Drawer dynamic block rendering and API dynamic field extraction is clean, robust, and fully compliant with project standards. All 6 requested new block types (`imageBlock`, `infoCard`, `infoBanner`, `textareaInput`, `selectInput`, `checkboxGroup`) are dynamically rendered with Tailwind CSS matching existing design tokens. Visual editing attributes (`data-tina-field`) are properly attached to every block's root JSX element. Dynamic form input state updates cleanly in `formData` without polluting or corrupting standard core keys, and Bed/Bath estimate calculation logic remains 100% intact both client-side and server-side. The API endpoint correctly segregates non-core keys into a `customFields` object and validates with Zod safely without schema failure. Production build (`npm run build`) succeeded without errors.

---

## Findings

### Minor Findings

#### Minor Finding 1: Default state initialization for `selectInput`
- **What**: For `selectInput`, if a `field.defaultValue` is provided in the schema, the HTML `<select>` element displays `field.defaultValue`, but `formData[field.name]` is not explicitly populated into state until the user triggers an `onChange` event or submits the form.
- **Where**: `components/booking/booking-drawer.tsx` (lines 651–672)
- **Why**: If a select input has a default value and is not required, submitting without touching the select could omit the default value from `formData`.
- **Suggestion**: Consider initializing `formData` with default values when step fields load if required, or ensure select options require explicit user selection.

#### Minor Finding 2: `checkboxGroup` price additions not included in estimate
- **What**: `checkboxGroup` items accept an optional `priceCents` property which renders a price badge (`+${formatPrice}`), but `priceCents` from dynamic checkbox groups are not added into the `estimate` calculation logic (only standard `addOns` list prices are included in `calculateEstimate`).
- **Where**: `components/booking/booking-drawer.tsx` (lines 216–229 & 703–705)
- **Why**: If a dynamic form schema uses `checkboxGroup` for paid add-ons rather than `addonsSelector`, the live estimate won't reflect those extra costs unless `calculateEstimate` is updated to sum dynamic `checkboxGroup` prices.
- **Suggestion**: If paid dynamic add-ons are used in custom schemas, extend `estimate` calculation to aggregate `priceCents` from active `checkboxGroup` selections.

---

## Verified Claims

- **6 New Block Types Rendered**:
  - `imageBlock` -> Verified: renders `<img>` with configurable aspect ratio classes (`aspect-video`, `aspect-[4/3]`, `aspect-square`, `aspect-auto`), fallback state, and optional caption.
  - `infoCard` -> Verified: renders card with configurable icon (`sparkles`, `shield`, `star`, `check`, `help`, `info`) and variant styles (`highlight`, `outline`, default).
  - `infoBanner` -> Verified: renders dismissible alert banner with warning/success/info color schemes and dismiss button state.
  - `textareaInput` -> Verified: renders `<textarea>` bound to `formData[field.name]`.
  - `selectInput` -> Verified: renders `<select>` dropdown with dynamic options bound to `formData[field.name]`.
  - `checkboxGroup` -> Verified: renders set of checkboxes managing string array state in `formData[field.name]`.
  - Method: Direct code inspection of `components/booking/booking-drawer.tsx` switch statement (lines 544–714). Pass.

- **`data-tina-field` Visual Editing Attributes**:
  - Verified: Every single block case (all 15 switch cases including the 6 new blocks) places `data-tina-field={tinaAttr}` on its outermost root JSX container.
  - Method: Code inspection of lines 355–714 in `components/booking/booking-drawer.tsx`. Pass.

- **Dynamic Form Input State Isolation**:
  - Verified: `updateField(key, value)` sets `formData[key] = value`. Dynamic fields store values under their respective `field.name`. Standard keys (`serviceType`, `bedrooms`, `bathrooms`, `addOns`, `preferredDate`, `preferredWindow`, `name`, `email`, `phone`) remain isolated and uncorrupted.
  - Method: Trace state updates and `initialState` in `components/booking/booking-drawer.tsx`. Pass.

- **Bed/Bath & Pricing Calculation Retention**:
  - Verified: `bedrooms` and `bathrooms` inputs update `formData` correctly, and `estimate` calculation computes base service pricing + add-ons cleanly on both client (`booking-drawer.tsx`) and server (`app/api/bookings/route.ts`).
  - Method: Traced `calculateEstimate` call in `lib/pricing.ts` and `route.ts`. Pass.

- **API Dynamic Field Processing**:
  - Verified: `app/api/bookings/route.ts` filters out the 12 core keys (`coreKeys`) and packages all extra form entries into `customFields`, attempting JSON parsing for arrays/objects. Zod `requestSchema` parses `customFields: z.record(z.string(), z.unknown())` with `.passthrough()`.
  - Method: Inspected `route.ts` lines 31–83. Pass.

- **Clean Production Build**:
  - Verified: Executed `npm run build`. Build completed with 0 errors and generated static/dynamic routes (`/`, `/_not-found`, `/api/bookings`).
  - Method: CLI `npm run build` execution. Pass.

---

## Coverage Gaps

- **Database Persistence Integration Test**: Direct insertion into SQLite/Postgres via Drizzle (`db.insert(bookingRequests)`) was verified via static analysis of schema and route logic, but not executed against a live test database environment (no test database credentials provided in context). Risk level: Low.

---

## Unverified Items

- **TinaCMS Admin Live Field Highlight**: Visual field highlighting inside TinaCMS iframe editor requires running the active Tina CMS dev server (`npx tinacms dev`). Verified code structure and `tinaField` helper bindings statically.

---

## Integrity & Adversarial Audit

- **Hardcoded test results / expected outputs**: None found.
- **Facade or dummy implementations**: None found. All controls handle state and render dynamic DOM elements.
- **Shortcuts or task bypasses**: None found.
- **Fabricated verification outputs**: None found.
