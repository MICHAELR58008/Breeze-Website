# Booking API & Dynamic Custom Fields Analysis Report

## Executive Summary
This report analyzes `app/api/bookings/route.ts`, validation schemas, and database handlers to prepare the endpoint to accept dynamic custom fields submitted from `BookingDrawer` (configured via Tina CMS or `booking.json`). 

Currently, `app/api/bookings/route.ts` explicitly extracts only 11 hardcoded fields (`serviceType`, `bedrooms`, `bathrooms`, `addOns`, `preferredDate`, `preferredWindow`, `name`, `email`, `phone`, `website`, `startedAt`) from incoming `FormData`. Any additional custom fields submitted by dynamic steps (e.g. `squareFeet`, `specialInstructions`, `accessCode`, `petDetails`) are omitted before Zod validation and dropped before database insertion.

We present a comprehensive, non-breaking design using Zod `.passthrough()` and automatic dynamic field aggregation into a `customFields` object, alongside a recommended `jsonb` schema update for database persistence.

---

## 1. Inspection of Existing Architecture

### A. Frontend Payload Generation (`components/booking/booking-drawer.tsx`)
- `BookingDrawerCore` manages form state via a `Record<string, any>` (`formData`).
- Fields rendered dynamically from Tina CMS or `booking.json` steps update state via `updateField(field.name, value)`.
- Upon submission, `submit()` iterates over `Object.entries(formData)` and appends every entry to a `FormData` instance:
  ```ts
  const body = new FormData()
  Object.entries(formData).forEach(([key, value]) => {
    body.set(key, typeof value === "object" ? JSON.stringify(value) : String(value))
  })
  body.set("startedAt", String(startedAt))
  body.set("website", "")
  photos.forEach((photo) => body.append("photos", photo))
  ```

### B. API Endpoint & Validation (`app/api/bookings/route.ts`)
- **Request Schema**:
  ```ts
  const requestSchema = z.object({
    serviceType: z.string().catch("deep"),
    bedrooms: z.coerce.number().int().min(1).max(10).catch(1),
    bathrooms: z.coerce.number().int().min(1).max(10).catch(1),
    addOns: z.array(z.string()).catch([]),
    preferredDate: z.string().catch(new Date().toISOString().split("T")[0]),
    preferredWindow: z.string().catch("flexible"),
    name: z.string().trim().catch("Guest Customer"),
    email: z.string().trim().catch("customer@example.com"),
    phone: z.string().trim().catch("0000000000"),
    website: z.string().max(0).catch(""),
    startedAt: z.coerce.number().catch(Date.now()),
  })
  ```
- **Manual Manual Key Extraction**:
  ```ts
  const formData = await request.formData()
  const parsed = requestSchema.safeParse({
    serviceType: formData.get("serviceType") || "deep",
    bedrooms: formData.get("bedrooms") || 1,
    bathrooms: formData.get("bathrooms") || 1,
    addOns: JSON.parse(String(formData.get("addOns") || "[]")),
    preferredDate: formData.get("preferredDate") || new Date().toISOString().split("T")[0],
    preferredWindow: formData.get("preferredWindow") || "flexible",
    name: formData.get("name") || "Guest Customer",
    email: formData.get("email") || "customer@example.com",
    phone: formData.get("phone") || "0000000000",
    website: formData.get("website") || "",
    startedAt: formData.get("startedAt") || Date.now(),
  })
  ```

### C. Database Schema (`lib/db/schema.ts`)
- The `bookingRequests` table defines the following Drizzle columns:
  - `id` (uuid)
  - `serviceType` (text)
  - `bedrooms` (integer)
  - `bathrooms` (integer)
  - `addOns` (jsonb array)
  - `estimateCents` (integer)
  - `estimateStatus` (text)
  - `preferredDate` (date)
  - `preferredWindow` (text)
  - `customerName` (text)
  - `customerEmail` (text)
  - `customerPhone` (text)
  - `photoPathnames` (jsonb array)
  - `status` (text)
  - `createdAt` / `updatedAt` (timestamps)
- There is currently **no column** to store unrecognized or custom fields.

---

## 2. Identified Limitations & Analysis

1. **Selective Extraction Problem**:
   Because `route.ts` manually constructs an object by calling `formData.get(...)` for 11 specific keys, any dynamic field added via Tina CMS (e.g. `entryCode`, `sqft`, `notes`) is completely omitted before Zod validation occurs.

2. **Schema Inflexibility**:
   `requestSchema` is a closed `z.object({...})`. If extra keys were passed directly into `safeParse`, Zod would strip them out by default without `.passthrough()`.

3. **Data Loss on DB Insert**:
   Even if Zod allowed extra fields, `db.insert(bookingRequests)` only inserts hardcoded columns. Dynamic responses from customers would be lost permanently.

4. **Single Content-Type Assumption**:
   `route.ts` currently assumes incoming body is always `multipart/form-data`. While `BookingDrawer` uses `FormData` due to photo uploads, supporting JSON payloads provides better developer experience for potential API clients or future features.

---

## 3. Recommended Design & Update Strategy

To accept dynamic custom fields seamlessly while guaranteeing 100% backward compatibility for all existing core fields, we propose the following changes:

### Step 1: Dynamic Payload Parsing in `route.ts`
Instead of pulling only 11 keys from `formData`, parse all incoming `FormData` entries (or JSON body if `Content-Type: application/json` is used):

```ts
const knownCoreKeys = new Set([
  "serviceType",
  "bedrooms",
  "bathrooms",
  "addOns",
  "preferredDate",
  "preferredWindow",
  "name",
  "email",
  "phone",
  "website",
  "startedAt",
  "customFields",
])

// Iterate over all entries in formData
const rawPayload: Record<string, any> = {}
const customFields: Record<string, any> = {}

for (const [key, value] of formData.entries()) {
  if (key === "photos") continue

  if (key === "addOns" || key === "customFields") {
    try {
      rawPayload[key] = typeof value === "string" ? JSON.parse(value) : value
    } catch {
      rawPayload[key] = value
    }
  } else if (knownCoreKeys.has(key)) {
    rawPayload[key] = value
  } else {
    // Dynamic field submitted from Booking Drawer
    try {
      customFields[key] = typeof value === "string" && (value.startsWith("{") || value.startsWith("[")) 
        ? JSON.parse(value) 
        : value
    } catch {
      customFields[key] = value
    }
  }
}

// Merge explicit customFields object if passed
if (rawPayload.customFields && typeof rawPayload.customFields === "object") {
  Object.assign(customFields, rawPayload.customFields)
}

rawPayload.customFields = customFields
```

### Step 2: Zod Schema Extension
Update `requestSchema` in `app/api/bookings/route.ts` to include `.passthrough()` and an explicit `customFields` object schema:

```ts
const requestSchema = z
  .object({
    serviceType: z.string().catch("deep"),
    bedrooms: z.coerce.number().int().min(1).max(10).catch(1),
    bathrooms: z.coerce.number().int().min(1).max(10).catch(1),
    addOns: z.array(z.string()).catch([]),
    preferredDate: z.string().catch(() => new Date().toISOString().split("T")[0]),
    preferredWindow: z.string().catch("flexible"),
    name: z.string().trim().catch("Guest Customer"),
    email: z.string().trim().catch("customer@example.com"),
    phone: z.string().trim().catch("0000000000"),
    website: z.string().max(0).catch(""),
    startedAt: z.coerce.number().catch(() => Date.now()),
    customFields: z.record(z.string(), z.unknown()).optional().default({}),
  })
  .passthrough()
```

### Step 3: Database Schema Update (`lib/db/schema.ts`)
Add a `customFields` JSONB column to `bookingRequests`:

```ts
export const bookingRequests = pgTable("booking_requests", {
  // ... existing fields ...
  customFields: jsonb("custom_fields").$type<Record<string, any>>().notNull().default({}),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})
```

And in `route.ts` DB insert:
```ts
await db.insert(bookingRequests).values({
  id: requestId,
  serviceType: parsed.data.serviceType,
  bedrooms: parsed.data.bedrooms,
  bathrooms: parsed.data.bathrooms,
  addOns: parsed.data.addOns,
  estimateCents: estimate,
  estimateStatus: estimate === null ? "custom_quote" : "estimated",
  preferredDate: parsed.data.preferredDate,
  preferredWindow: parsed.data.preferredWindow,
  customerName: parsed.data.name,
  customerEmail: parsed.data.email,
  customerPhone: parsed.data.phone,
  photoPathnames: uploaded,
  customFields: parsed.data.customFields,
})
```

---

## 4. Verification & Backward Compatibility Assessment

1. **Core Fields Integrity**:
   - `bedrooms`, `bathrooms`, `serviceType`, `addOns`, `preferredDate`, `preferredWindow`, `name`, `email`, `phone`, `startedAt`, `website` preserve their exact validation rules, coercion logic, and default fallbacks (`.catch(...)`).
2. **Honeypot Functionality**:
   - `website` remaining at max length 0 prevents spam submissions regardless of custom dynamic fields.
3. **Photo Upload & Cleanup**:
   - Vercel Blob file handling (`photos`) remains untouched and continues to upload up to 5 images max 5 MB each.
4. **Dynamic Field Flexibility**:
   - Any dynamic custom inputs created in Tina CMS or `booking.json` will be automatically collected into `customFields` without triggering Zod validation errors or type mismatches.
